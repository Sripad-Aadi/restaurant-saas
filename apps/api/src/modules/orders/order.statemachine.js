import { ALLOWED_TRANSITIONS } from '@restaurant-saas/shared';

export const transitionOrder = (currentStatus, newStatus) => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed) {
    throw { status: 400, message: `Unknown current status: ${currentStatus}` };
  }

  if (!allowed.includes(newStatus)) {
    throw {
      status: 400,
      message: `Cannot transition order from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`,
    };
  }

  return true;
};