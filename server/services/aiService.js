const Car = require('../models/Car');

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const searchParams = extractSearchParams(message);
    let recommendedCars = [];
    if (searchParams) {
      recommendedCars = await getCarRecommendations(searchParams);
    }
    res.json({
      success: true,
      reply: `I found some cars matching "${message}". Here are my recommendations based on your search!`,
      recommendedCars,
      updatedHistory: [],
    });
  } catch (error) {
    next(error);
  }
};

const extractSearchParams = (message) => {
  const lowerMessage = message.toLowerCase();
  const budgetMatch = message.match(/(\d+)/);
  const maxPrice = budgetMatch ? parseInt(budgetMatch[1]) : null;
  const categories = ['SUV', 'Sedan', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Van'];
  const category = categories.find(cat => lowerMessage.includes(cat.toLowerCase()));
  const fuels = ['electric', 'petrol', 'diesel', 'hybrid'];
  const fuel = fuels.find(f => lowerMessage.includes(f));
  if (!maxPrice && !category && !fuel) return null;
  return { maxPrice, category, fuel };
};

const getCarRecommendations = async (params) => {
  try {
    const query = { isApproved: true, isAvailable: true };
    if (params.maxPrice) query.pricePerDay = { $lte: params.maxPrice };
    if (params.category) query.category = params.category;
    if (params.fuel) query.fuel = { $regex: params.fuel, $options: 'i' };
    return await Car.find(query)
      .select('name brand model category pricePerDay images location rating fuel transmission seats')
      .sort({ 'rating.average': -1 })
      .limit(4);
  } catch (error) {
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
