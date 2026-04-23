// ============================================================
//  File : DataAccess/DATrainerAttendance.cs
// ============================================================
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DATrainerAttendance : ITrainerAttendance
    {
        private readonly string ProcName = "GYM_TRAINER_ATTENDANCE_PROC";

        public Response GetAll()
            => Execute(new TrainerAttendanceRequestModel { p_action_type = "001" }, true);

        public Response GetByTrainer(int trainerId)
            => Execute(new TrainerAttendanceRequestModel
            {
                p_action_type = "002",
                p_trainer_id = trainerId,
                p_user_id = trainerId // SP handles both
            }, true);

        public Response GetByDateRange(string dateFrom, string dateTo)
            => Execute(new TrainerAttendanceRequestModel
            {
                p_action_type = "003",
                p_date_from = dateFrom,
                p_date_to = dateTo
            }, true);

        public Response CheckIn(int trainerId)
            => Execute(new TrainerAttendanceRequestModel
            {
                p_action_type = "004",
                p_trainer_id = trainerId,
                p_check_in_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            }, false);

        public Response CheckOut(int trainerId)
            => Execute(new TrainerAttendanceRequestModel
            {
                p_action_type = "005",
                p_trainer_id = trainerId,
                p_check_out_time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            }, false);

        public Response GetTodayAttendance()
            => Execute(new TrainerAttendanceRequestModel { p_action_type = "006" }, true);

        private Response Execute(TrainerAttendanceRequestModel req, bool isRead)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = isRead
                    ? db.ProcedureRead(req, ProcName)
                    : db.ProcedureExecute(req, ProcName);

                if (res.ResultStatusCode == "1")
                {
                    if (isRead)
                    {
                        var list = new List<TrainerAttendanceModel>();
                        foreach (DataRow row in res.ResultDataTable.Rows)
                            list.Add(new TrainerAttendanceModel
                            {
                                trainerAttendanceId = row["trainerAttendanceId"] != DBNull.Value
                                    ? Convert.ToInt32(row["trainerAttendanceId"]) : (int?)null,
                                trainerId = row["trainerId"] != DBNull.Value
                                    ? Convert.ToInt32(row["trainerId"]) : (int?)null,
                                trainerName = row.Table.Columns.Contains("trainerName")
                                    ? row["trainerName"]?.ToString() : null,
                                check_in_time = row["check_in_time"]?.ToString(),
                                check_out_time = row["check_out_time"]?.ToString()
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