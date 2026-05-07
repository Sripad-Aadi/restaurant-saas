import SubscriptionPlan from '../../models/SubscriptionPlan.js';
import Subscription from '../../models/Subscription.js';
import Store from '../../models/Store.js';

export const getAllPlans = async () => {
  return SubscriptionPlan.find().sort({ price: 1 });
};

export const createPlan = async (planData) => {
  return SubscriptionPlan.create(planData);
};

export const updatePlan = async (id, planData) => {
  return SubscriptionPlan.findByIdAndUpdate(id, planData, { new: true });
};

export const deletePlan = async (id) => {
  return SubscriptionPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

export const getActiveSubscriptions = async () => {
  return Subscription.find()
    .populate('storeId', 'name slug')
    .populate('planId', 'name price commissionRate')
    .sort({ createdAt: -1 });
};

export const assignPlanToStore = async (storeId, planId, durationMonths = 1) => {
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);

  return Subscription.findOneAndUpdate(
    { storeId },
    { 
      planId, 
      status: 'active', 
      startDate: new Date(), 
      endDate 
    },
    { upsert: true, new: true }
  );
};
