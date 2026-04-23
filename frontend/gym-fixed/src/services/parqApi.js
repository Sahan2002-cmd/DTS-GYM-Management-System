import { apiClient, toForm } from './_apiClient';

// Admin: all PAR-Q records
export const getAllParQ = () =>
  apiClient.get('/ParQ/GetAll');

// Any role: get one user's PAR-Q
export const getParQByUserId = (userId) =>
  apiClient.get(`/ParQ/GetByUserId?userId=${userId}`);

// Trainer: get PAR-Q records for all assigned members
export const getParQByTrainerId = (trainerId) =>
  apiClient.get(`/ParQ/GetByTrainerId?trainerId=${trainerId}`);

// Member: submit or update own PAR-Q
// answers = { p_q1, p_q2, p_q3, p_q4, p_q5, p_q6, p_q7,
//             p_q7_details, p_physician_clearance }
export const saveParQ = (userId, answers) => {
  // Convert boolean values to 1/0 for ASP.NET backend
  const formData = { p_user_id: userId };
  Object.entries(answers || {}).forEach(([k, v]) => {
    if (typeof v === 'boolean') {
      formData[k] = v ? 1 : 0;
    } else {
      formData[k] = v;
    }
  });
  
  const formString = toForm(formData);
  console.log('Sending form data to /ParQ/Save:', formString);
  console.log('Form data object:', formData);
  
  return apiClient.post('/ParQ/Save', formString);
};