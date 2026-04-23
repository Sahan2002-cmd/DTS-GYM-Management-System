using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DATrainerTimeSlot : ITrainerTimeSlot
    {
        private readonly string ProcName = "GYM_TRAINER_TIMESLOT_PROC";

        public Response GetAll()
            => Read(new TrainerTimeSlotRequestModel { p_action_type = "001" });

        public Response GetById(int trainerTimeslotId)
            => Read(new TrainerTimeSlotRequestModel
            {
                p_action_type = "002",
                p_trainer_timeslot_id = trainerTimeslotId
            });

        public Response GetByTrainer(int trainerId)
            => Read(new TrainerTimeSlotRequestModel
            {
                p_action_type = "003",
                p_trainer_id = trainerId
            });

        public Response Add(TrainerTimeSlotRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Time slot request submitted. Awaiting admin approval.");
        }

        public Response ApproveOrReject(int trainerTimeslotId, int isActive, int adminId)
            => Exec(new TrainerTimeSlotRequestModel
            {
                p_action_type = "005",
                p_trainer_timeslot_id = trainerTimeslotId,
                p_is_active = isActive,
                p_admin_id = adminId
            }, isActive == 1 ? "Trainer time slot approved." : "Trainer time slot rejected.");

        public Response Delete(int trainerTimeslotId, int adminId)
            => Exec(new TrainerTimeSlotRequestModel
            {
                p_action_type = "006",
                p_trainer_timeslot_id = trainerTimeslotId,
                p_admin_id = adminId
            }, "Trainer time slot deleted successfully.");

        // ── Private Helpers ───────────────────────────────────────────

        private Response Read(TrainerTimeSlotRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<TrainerTimeSlotModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapRow(row));
                    result.ResultSet = list.Count == 1 ? (object)list[0] : list;
                    result.StatusCode = 200;
                }
                else
                {
                    result.StatusCode = 500;
                    // BUG FIX: Was only setting Result (never read by frontend).
                    // Frontend getErrorMsg() checks Message → message → fallback.
                    // Set BOTH so the real SQL error is visible in the toast.
                    result.Result = res.ExceptionMessage;
                    result.Message = res.ExceptionMessage;
                }
            }
            return result;
        }

        private Response Exec(TrainerTimeSlotRequestModel req, string successMsg)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = successMsg;
                    result.Message = successMsg;
                }
                else
                {
                    result.StatusCode = 500;
                    // BUG FIX: Was only setting Result (never read by frontend).
                    // Frontend getErrorMsg() checks Message → message → fallback.
                    // Set BOTH so the real SQL error is visible in the toast.
                    result.Result = res.ExceptionMessage;
                    result.Message = res.ExceptionMessage;
                }
            }
            return result;
        }

        // ── Safe column readers ───────────────────────────────────────

        private static string SafeStr(DataRow row, string col)
            => row.Table.Columns.Contains(col) && row[col] != DBNull.Value
               ? row[col].ToString() : null;

        private static int? SafeInt(DataRow row, string col)
            => row.Table.Columns.Contains(col) && row[col] != DBNull.Value
               ? Convert.ToInt32(row[col]) : (int?)null;

        private static bool? SafeBool(DataRow row, string col)
            => row.Table.Columns.Contains(col) && row[col] != DBNull.Value
               ? Convert.ToBoolean(row[col]) : (bool?)null;

        private static string SafeDate(DataRow row, string col)
        {
            if (!row.Table.Columns.Contains(col) || row[col] == DBNull.Value) return null;
            return Convert.ToDateTime(row[col]).ToString("yyyy-MM-dd");
        }

        private TrainerTimeSlotModel MapRow(DataRow row) => new TrainerTimeSlotModel
        {
            trainerTimeslot_Id = SafeInt(row, "trainerTimeslot_Id"),
            trainer_Id = SafeInt(row, "trainer_Id"),
            timeslot_Id = SafeInt(row, "timeslot_Id"),
            day_of_week = SafeStr(row, "day_of_week"),
            isActive = SafeBool(row, "isActive"),
            starttime = SafeStr(row, "starttime"),
            endtime = SafeStr(row, "endtime"),
            trainerName = SafeStr(row, "trainerName"),
            schedule_type = SafeStr(row, "schedule_type"),
            start_date = SafeDate(row, "start_date"),
            end_date = SafeDate(row, "end_date"),
            selected_days = SafeStr(row, "selected_days"),
            custom_starttime = SafeStr(row, "custom_starttime"),
            custom_endtime = SafeStr(row, "custom_endtime"),
        };
    }
}