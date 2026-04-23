import { apiClient } from './_apiClient';
 
// GET /Report/Members?dateFrom=&dateTo=&adminId=
export const getMemberReport = (adminId, dateFrom, dateTo) =>
  apiClient.get(`/Report/Members?adminId=${adminId}&dateFrom=${dateFrom||''}&dateTo=${dateTo||''}`);
 
// GET /Report/Trainers?adminId=&dateFrom=&dateTo=
export const getTrainerReport = (adminId, dateFrom, dateTo) =>
  apiClient.get(`/Report/Trainers?adminId=${adminId}&dateFrom=${dateFrom||''}&dateTo=${dateTo||''}`);
 
// GET /Report/Attendance?adminId=&memberId=&dateFrom=&dateTo=
export const getAttendanceReport = (adminId, memberId, dateFrom, dateTo) =>
  apiClient.get(`/Report/Attendance?adminId=${adminId}&memberId=${memberId||''}&dateFrom=${dateFrom||''}&dateTo=${dateTo||''}`);
 
// GET /Report/Subscriptions?adminId=&dateFrom=&dateTo=
export const getSubscriptionReport = (adminId, dateFrom, dateTo) =>
  apiClient.get(`/Report/Subscriptions?adminId=${adminId}&dateFrom=${dateFrom||''}&dateTo=${dateTo||''}`);
 
// GET /Report/Payments?adminId=&dateFrom=&dateTo=
export const getPaymentReport = (adminId, dateFrom, dateTo) =>
  apiClient.get(`/Report/Payments?adminId=${adminId}&dateFrom=${dateFrom||''}&dateTo=${dateTo||''}`);
 
// GET /Report/ExportPdf?type=&dateFrom=&dateTo=&adminId=&memberId= (returns base64 PDF)
export const exportReportPdf = (adminId, type, dateFrom, dateTo, memberId) =>
  apiClient.get(`/Report/ExportPdf?adminId=${adminId}&type=${type}&dateFrom=${dateFrom||''}&dateTo=${dateTo||''}&memberId=${memberId||''}`);
 