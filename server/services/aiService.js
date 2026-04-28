const Car = require('../models/Car');
const logger = require('../utils/logger');

// Try to use OpenAI if key exists
let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your_openai_api_key') {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  logger.warn('OpenAI not available');
}

const SYSTEM_PROMPT = `You are DriveEasy's AI assistant, an expert car rental advisor in India.
You help users find the perfect car based on their needs.
Always be friendly, concise, and helpful. Format currency as ₹ (Indian Rupees).
When users describe their needs, provide helpful recommendations.
Available categories: Sedan, SUV, Hatchback, Luxury, Sports, Electric, Van.
Available cities: Mumbai, Bangalore, Delhi, Pune, Chennai, Hyderabad, Goa.`;

exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Extract search params from message
    const searchParams = extractSearchParams(message);
    let recommendedCars = [];
    if (searchParams) {
      recommendedCars = await getCarRecommendations(searchParams);
    }

    let reply = '';

    // Use OpenAI if available
    if (openai) {
      try {
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversationHistory.slice(-8),
          { role: 'user', content: message },
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 400,
          temperature: 0.7,
        });

        reply = completion.choices[0].message.content;
      } catch (err) {
        logger.error('OpenAI error:', err.message);
        reply = generateSmartReply(message, recommendedCars, searchParams);
      }
    } else {
      // Smart fallback without OpenAI
      reply = generateSmartReply(message, recommendedCars, searchParams);
    }

    res.json({
      success: true,
      reply,
      recommendedCars,
      updatedHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: reply }
      ],
    });
  } catch (error) {
    next(error);
  }
};

function generateSmartReply(message, cars, params) {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! Welcome to DriveEasy! 🚗 I'm your AI car assistant. Tell me what kind of car you're looking for — mention your budget, city, or car type and I'll find the perfect match for you!";
  }

  if (lower.includes('suv')) {
    if (cars.length > 0) return `Great choice! SUVs are perfect for comfort and space. I found ${cars.length} SUV(s) matching your requirements. Check them out below! 🚙`;
    return "We have some great SUVs available! Try searching with a specific city like Mumbai or Bangalore to see available SUVs. 🚙";
  }

  if (lower.includes('electric') || lower.includes('ev')) {
    if (cars.length > 0) return `Excellent eco-friendly choice! I found ${cars.length} electric vehicle(s) for you. Going green has never been easier! ⚡`;
    return "We have electric vehicles available in Pune! They offer great range and a smooth driving experience. ⚡";
  }

  if (lower.includes('luxury') || lower.includes('bmw') || lower.includes('premium')) {
    if (cars.length > 0) return `You have great taste! I found ${cars.length} luxury vehicle(s) for you. Experience premium comfort! 🏎️`;
    return "Our luxury fleet includes BMW 5 Series and more. Available in Delhi with premium features. 🏎️";
  }

  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable') || lower.includes('under')) {
    if (cars.length > 0) return `Great! I found ${cars.length} budget-friendly car(s) matching your requirements. Quality rides at great prices! 💰`;
    return "We have budget-friendly options starting from just ₹1,200/day! Check out our Hatchback and Sedan categories. 💰";
  }

  if (lower.includes('family') || lower.includes('7 seat') || lower.includes('7seat') || lower.includes('spacious')) {
    if (cars.length > 0) return `Perfect for family trips! I found ${cars.length} spacious vehicle(s) that can accommodate your family comfortably. 👨‍👩‍👧‍👦`;
    return "For family trips, I recommend our Toyota Innova Crysta — 7 seater with AC and comfort features, available in Mumbai. 👨‍👩‍👧‍👦";
  }

  if (lower.includes('goa') || lower.includes('beach') || lower.includes('thar') || lower.includes('offroad')) {
    if (cars.length > 0) return `Adventure awaits! I found ${cars.length} vehicle(s) perfect for your Goa trip. 🏖️`;
    return "For Goa trips, the Mahindra Thar 4x4 is perfect — convertible, powerful, and great for beach drives! Available in Goa at ₹3,200/day. 🏖️";
  }

  if (lower.includes('mumbai')) {
    return "In Mumbai we have Swift Premium (₹1,200/day), Innova Crysta (₹3,500/day), and BMW 5 Series (₹8,500/day) available. Which suits your budget? 🏙️";
  }

  if (lower.includes('bangalore') || lower.includes('bengaluru')) {
    return "In Bangalore we have the Hyundai Creta SX (₹2,800/day) — perfect for the city's roads! Want to book it? 🏙️";
  }

  if (lower.includes('delhi')) {
    return "In Delhi we have the BMW 530d M Sport (₹8,500/day) — ultimate luxury for the capital! 🏙️";
  }

  if (lower.includes('pune')) {
    return "In Pune we have the Tata Nexon EV Max (₹2,200/day) — go green and save on fuel! ⚡";
  }

  if (lower.includes('thank')) {
    return "You're welcome! Happy to help. Feel free to ask anything about our cars. Have a great drive! 🚗";
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('how much')) {
    return "Our prices start from ₹1,200/day for hatchbacks, ₹1,800/day for sedans, ₹2,400-2,800/day for SUVs, and up to ₹8,500/day for luxury cars. All prices include basic insurance. Which category interests you? 💰";
  }

  if (lower.includes('book') || lower.includes('reserve')) {
    return "To book a car: 1) Browse our cars 2) Select your dates 3) Click 'Book Now' — it's that simple! The price breakdown with GST is shown automatically. Ready to book? 📅";
  }

  if (lower.includes('cancel')) {
    return "You can cancel your booking for free up to 24 hours before pickup! Go to 'My Bookings' and click Cancel. ✅";
  }

  if (lower.includes('available') || lower.includes('check')) {
    return "All cars showing green dots are available right now! Use the filters to search by city, category, and price range. Want me to help you find something specific? 🔍";
  }

  // Default smart reply based on params
  if (params && cars.length > 0) {
    const parts = [];
    if (params.category) parts.push(params.category);
    if (params.city) parts.push(`in ${params.city}`);
    if (params.maxPrice) parts.push(`under ₹${params.maxPrice}/day`);
    return `I found ${cars.length} ${parts.join(' ')} car(s) for you! Check the recommendations below. 🚗`;
  }

  if (params && cars.length === 0) {
    return "I couldn't find exact matches, but try adjusting your filters — maybe a nearby city or slightly higher budget? I'm here to help! 🔍";
  }

  return `I understand you're looking for "${message}". Could you tell me more? For example:\n• Which city? (Mumbai, Delhi, Bangalore, Pune, Goa)\n• What's your budget per day?\n• What type of car? (SUV, Sedan, Luxury, Electric)\nI'll find the perfect car for you! 🚗`;
}

const extractSearchParams = (message) => {
  const lowerMessage = message.toLowerCase();

  // Extract budget
  const budgetPatterns = [
    /under\s*₹?\s*(\d+(?:,\d+)?)/i,
    /₹\s*(\d+(?:,\d+)?)/i,
    /(\d+(?:,\d+)?)\s*(?:rupees?|rs\.?|inr)/i,
    /budget\s*(?:of|is|:)?\s*₹?\s*(\d+(?:,\d+)?)/i,
  ];

  let maxPrice = null;
  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) {
      maxPrice = parseInt(match[1].replace(',', ''));
      break;
    }
  }

  // Extract category
  const categories = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Van'];
  const category = categories.find(cat => lowerMessage.includes(cat.toLowerCase()));

  // Extract city
  const cities = ['mumbai', 'bangalore', 'bengaluru', 'delhi', 'pune', 'chennai', 'hyderabad', 'goa'];
  const foundCity = cities.find(city => lowerMessage.includes(city));
  const city = foundCity === 'bengaluru' ? 'bangalore' : foundCity;

  // Extract fuel type
  const fuels = ['electric', 'petrol', 'diesel', 'hybrid', 'cng'];
  const fuel = fuels.find(f => lowerMessage.includes(f));

  // Extract seats
  const seatsMatch = message.match(/(\d+)\s*(?:seater?|seat|passenger|people|person)/i);
  const seats = seatsMatch ? parseInt(seatsMatch[1]) : null;

  if (!maxPrice && !category && !city && !fuel && !seats) return null;
  return { maxPrice, category, city, fuel, seats };
};

const getCarRecommendations = async (params) => {
  try {
    const query = { isApproved: true, isAvailable: true };
    if (params.maxPrice) query.pricePerDay = { $lte: params.maxPrice };
    if (params.category) query.category = params.category;
    if (params.city) query['location.city'] = { $regex: params.city, $options: 'i' };
    if (params.fuel) query.fuel = { $regex: params.fuel, $options: 'i' };
    if (params.seats) query.seats = { $gte: params.seats };

    return await Car.find(query)
      .select('name brand model category pricePerDay images location rating fuel transmission seats features')
      .sort({ 'rating.average': -1 })
      .limit(4);
  } catch (error) {
    logger.error('Car recommendation error:', error);
    return [];
  }
};

exports.getRecommendations = async (req, res, next) => {
  try {
    const { preferences, budget, location } = req.body;
    const query = { isApproved: true, isAvailable: true };
    if (budget) query.pricePerDay = { $lte: budget };
    if (location) query['location.city'] = { $regex: location, $options: 'i' };
    if (preferences?.categories?.length) query.category = { $in: preferences.categories };
    const cars = await Car.find(query)
      .select('name brand model category pricePerDay images location rating fuel transmission seats')
      .sort({ 'rating.average': -1 })
      .limit(6);
    res.json({ success: true, cars });
  } catch (error) {
    next(error);
  }
};