// ============================================================
//  File : DataAccess/DAAttendance.cs
//  WhatsApp notifications for check-in/check-out
// ============================================================
using GymManagement.BusinessLayer;
using GymManagement.BusinessLogic;
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace GymManagement.DataAccess
{
    public class DAAttendance : IAttendance
    {
        private readonly string ProcName = "GYM_ATTENDANCE_PROC";

        public Response GetAll()
        {
            return Execute(new AttendanceRequestModel { p_action_type = "001" }, true);
        }

        public Response GetByMember(int memberId)
        {
            return Execute(new AttendanceRequestModel
            {
                p_action_type = "002",
                // Pass to both to be safe, SP handles logic
                p_member_id = memberId,
                p_user_id = memberId
            }, true);
        }

        public Response GetByDateRange(string dateFrom, string dateTo)
        {
            return Execute(new AttendanceRequestModel
            {
                p_action_type = "003",
                p_date_from = dateFrom,
                p_date_to = dateTo
            }, true);
        }

        public Response CheckIn(int rfidId)
        {
            var response = Execute(new AttendanceRequestModel
            {
                p_action_type = "004",
                p_rfid_id = rfidId,
                p_check_in_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            }, false);

            if (response.StatusCode == 200)
            {
                Task.Run(async () =>
                {
                    try
                    {
                        var memberInfo = GetMemberInfoByRfid(rfidId);
                        if (memberInfo != null && !string.IsNullOrEmpty(memberInfo.Item1))
                            await WhatsAppHelper.SendCheckInNotificationAsync(memberInfo.Item1, memberInfo.Item2);
                    }
                    catch { /* Never block check-in if WhatsApp fails */ }
                });
            }

            return response;
        }

        public Response CheckOut(int rfidId)
        {
            var response = Execute(new AttendanceRequestModel
            {
                p_action_type = "005",
                p_rfid_id = rfidId,
                p_check_out_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            }, false);

            if (response.StatusCode == 200)
            {
                Task.Run(async () =>
                {
                    try
                    {
                        var memberInfo = GetMemberInfoByRfid(rfidId);
                        if (memberInfo != null && !string.IsNullOrEmpty(memberInfo.Item1))
                            await WhatsAppHelper.SendCheckOutNotificationAsync(memberInfo.Item1, memberInfo.Item2);
                    }
                    catch { /* Never block check-out if WhatsApp fails */ }
                });
            }

            return response;
        }

        public Response GetTodayAttendance()
        {
            return Execute(new AttendanceRequestModel { p_action_type = "006" }, true);
        }

        private Tuple<string, string> GetMemberInfoByRfid(int rfidId)
        {
            using (var db = new DBconnect())
            {
                var req = new AttendanceRequestModel
                {
                    p_action_type = "007",
                    p_rfid_id = rfidId
                };
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1" && res.ResultDataTable.Rows.Count > 0)
                {
                    var row = res.ResultDataTable.Rows[0];
                    string phone = row.Table.Columns.Contains("phone") ? row["phone"]?.ToString() : null;
                    string name = row.Table.Columns.Contains("memberName") ? row["memberName"]?.ToString() : "Member";
                    return Tuple.Create(phone, name);
                }
            }
            return null;
        }

        private Response Execute(AttendanceRequestModel req, bool isRead)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                ProcedureDBModel res = isRead
                    ? db.ProcedureRead(req, ProcName)
                    : db.ProcedureExecute(req, ProcName);

                if (res.ResultStatusCode == "1")
                {
                    if (isRead)
                    {
                        var list = new List<AttendanceModel>();
                        foreach (DataRow row in res.ResultDataTable.Rows)
                            list.Add(new AttendanceModel
                            {
                                attendanceId = row["attendanceId"] != DBNull.Value ? Convert.ToInt32(row["attendanceId"]) : (int?)null,
                                memberId = row["memberId"] != DBNull.Value ? Convert.ToInt32(row["memberId"]) : (int?)null,
                                rfidId = row["rfId_Id"] != DBNull.Value ? Convert.ToInt32(row["rfId_Id"]) : (int?)null,
                                checkInTime = row["check_in_time"]?.ToString(),
                                checkOutTime = row["check_out_time"]?.ToString(),
                                memberName = row.Table.Columns.Contains("memberName") ? row["memberName"]?.ToString() : null
                            });
                        result.ResultSet = list;
                    }
                    result.StatusCode = 200;
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }
    }
}