import SystemSetting from '../../models/SystemSetting.js';

export const getSettings = async () => {
  const settings = await SystemSetting.find();
  // Transform to a simple object for easier frontend use
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
};

export const updateSettings = async (settingsMap, userId) => {
  const updates = Object.entries(settingsMap).map(([key, value]) => {
    return SystemSetting.findOneAndUpdate(
      { key },
      { key, value, updatedBy: userId },
      { upsert: true, new: true }
    );
  });
  
  await Promise.all(updates);
  return getSettings();
};
