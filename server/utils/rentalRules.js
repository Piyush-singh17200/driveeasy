const Booking = require('../models/Booking');

const blockingStatuses = ['pending', 'confirmed', 'active'];

const normalizeRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid booking date range');
  }
  if (end <= start) {
    throw new Error('End date must be after start date');
  }
  return { start, end };
};

const calculateRentalPrice = (startDate, endDate, pricePerDay) => {
  const { start, end } = normalizeRange(startDate, endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil((end - start) / msPerDay);
  let priceModifier = 1;
  const isWeekend = [0, 6].includes(start.getDay()) || [0, 6].includes(end.getDay());
  if (isWeekend) priceModifier += 0.15;
  if (totalDays >= 7) priceModifier -= 0.10;

  const baseSubtotal = totalDays * pricePerDay;
  const subtotal = Math.round(baseSubtotal * priceModifier);
  const taxes = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + taxes;

  return { start, end, totalDays, priceModifier, baseSubtotal, subtotal, taxes, totalAmount };
};

const findBookingConflict = ({ carId, startDate, endDate, excludeBookingId }) => {
  const { start, end } = normalizeRange(startDate, endDate);
  const query = {
    car: carId,
    status: { $in: blockingStatuses },
    startDate: { $lt: end },
    endDate: { $gt: start },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  return Booking.findOne(query);
};

const findConflictingCarIds = async ({ startDate, endDate }) => {
  const { start, end } = normalizeRange(startDate, endDate);
  return Booking.distinct('car', {
    status: { $in: blockingStatuses },
    startDate: { $lt: end },
    endDate: { $gt: start },
  });
};

module.exports = {
  blockingStatuses,
  calculateRentalPrice,
  findBookingConflict,
  findConflictingCarIds,
};
