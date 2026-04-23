using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DASchedule : ISchedule
    {
        private readonly string ProcName = "GYM_SCHEDULE_PROC";

        public Response GetAll()
        {
            return Read(new ScheduleRequestModel { p_action_type = "001" });
        }

        public Response GetById(int scheduleId)
        {
            return Read(new ScheduleRequestModel
            {
                p_action_type = "002",
                p_schedule_id = scheduleId
            });
        }

        public Response GetByMember(int memberId)
        {
            return Read(new ScheduleRequestModel
            {
                p_action_type = "003",
                p_member_id = memberId
            });
        }

        public Response GetByTrainer(int trainerId)
        {
            return Read(new ScheduleRequestModel
            {
                p_action_type = "004",
                p_trainer_id = trainerId
            });
        }

        public Response GetByDate(string scheduleDate)
        {
            return Read(new ScheduleRequestModel
            {
                p_action_type = "005",
                p_schedule_date = scheduleDate
            });
        }

        public Response Add(ScheduleRequestModel req)
        {
            req.p_action_type = "006";
            return Exec(req, "Schedule created successfully.");
        }

        public Response Edit(ScheduleRequestModel req)
        {
            req.p_action_type = "007";
            return Exec(req, "Schedule updated successfully.");
        }

        //public Response UpdateStatus(int scheduleId, string status)
        //{
        //    return Exec(new ScheduleRequestModel
        //    {
        //        p_action_type = "008",
        //        p_schedule_id = scheduleId,
        //        p_status = status
        //    }, $"Schedule status updated to '{status}'.");
        //}
        // REPLACE UpdateStatus method signature and body:
        public Response UpdateStatus(int scheduleId, string status, string reason = null)
        {
            return Exec(new ScheduleRequestModel
            {
                p_action_type = "007",
                p_schedule_id = scheduleId,
                p_status = status,
                p_reason = reason,
            }, "Status updated.");
        }

        public Response Delete(int scheduleId, int adminId)
        {
            return Exec(new ScheduleRequestModel
            {
                p_action_type = "009",
                p_schedule_id = scheduleId,
                p_admin_id = adminId
            }, "Schedule deleted successfully.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(ScheduleRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<ScheduleModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapRow(row));

                    result.ResultSet = list.Count == 1 ? (object)list[0] : list;
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

        private Response Exec(ScheduleRequestModel req, string successMsg)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1"
                                    ? successMsg
                                    : res.ExceptionMessage;
            }
            return result;
        }

        //private ScheduleModel MapRow(DataRow row) =>
        //    new ScheduleModel
        //    {
        //        scheduleId = row["scheduleId"] != DBNull.Value
        //                       ? Convert.ToInt32(row["scheduleId"]) : (int?)null,
        //        rfid_Id = row["rfid_Id"] != DBNull.Value
        //                       ? Convert.ToInt32(row["rfid_Id"]) : (int?)null,
        //        memberId = row["memberId"] != DBNull.Value
        //                       ? Convert.ToInt32(row["memberId"]) : (int?)null,
        //        trainerId = row["trainerId"] != DBNull.Value
        //                       ? Convert.ToInt32(row["trainerId"]) : (int?)null,
        //        timeslotId = row["timeslotId"] != DBNull.Value
        //                       ? Convert.ToInt32(row["timeslotId"]) : (int?)null,
        //        scheduleDate = row["scheduleDate"]?.ToString(),
        //        status = row["status"]?.ToString(),
        //        memberName = row.Table.Columns.Contains("memberName")
        //                       ? row["memberName"]?.ToString() : null,
        //        trainerName = row.Table.Columns.Contains("trainerName")
        //                       ? row["trainerName"]?.ToString() : null,
        //        starttime = row.Table.Columns.Contains("starttime")
        //                       ? row["starttime"]?.ToString() : null,
        //        endtime = row.Table.Columns.Contains("endtime")
        //                       ? row["endtime"]?.ToString() : null
        //    };

        private ScheduleModel MapRow(DataRow row) => new ScheduleModel
        {
            scheduleId = row.Table.Columns.Contains("scheduleId") && row["scheduleId"] != DBNull.Value
                   ? Convert.ToInt32(row["scheduleId"]) : (int?)null,

            // ✅ FIX: guard rfid_Id — not returned in all SELECT queries
            rfid_Id = row.Table.Columns.Contains("rfid_Id") && row["rfid_Id"] != DBNull.Value
                   ? Convert.ToInt32(row["rfid_Id"]) : (int?)null,

            memberId = row.Table.Columns.Contains("memberId") && row["memberId"] != DBNull.Value
                   ? Convert.ToInt32(row["memberId"]) : (int?)null,

            trainerId = row.Table.Columns.Contains("trainerId") && row["trainerId"] != DBNull.Value
                   ? Convert.ToInt32(row["trainerId"]) : (int?)null,

            timeslotId = row.Table.Columns.Contains("timeslotId") && row["timeslotId"] != DBNull.Value
                   ? Convert.ToInt32(row["timeslotId"]) : (int?)null,

            scheduleDate = row.Table.Columns.Contains("scheduleDate")
                   ? row["scheduleDate"]?.ToString() : null,

            status = row.Table.Columns.Contains("status")
                   ? row["status"]?.ToString() : null,

            memberName = row.Table.Columns.Contains("memberName")
                   ? row["memberName"]?.ToString() : null,

            trainerName = row.Table.Columns.Contains("trainerName")
                   ? row["trainerName"]?.ToString() : null,

            starttime = row.Table.Columns.Contains("starttime")
                   ? row["starttime"]?.ToString() : null,

            endtime = row.Table.Columns.Contains("endtime")
                   ? row["endtime"]?.ToString() : null,
        };


    }
}