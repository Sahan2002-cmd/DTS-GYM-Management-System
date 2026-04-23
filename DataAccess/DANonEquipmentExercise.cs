using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DANonEquipmentExercise : INonEquipmentExercise
    {
        private readonly string ProcName = "GYM_NON_EQUIPMENT_EXERCISE_PROC";

        public Response GetAll()
        {
            return Read(new NonEquipmentExerciseRequestModel { p_action_type = "001" });
        }

        public Response GetById(int useId)
        {
            return Read(new NonEquipmentExerciseRequestModel
            {
                p_action_type = "002",
                p_use_id = useId
            });
        }

        public Response GetBySchedule(int scheduleId)
        {
            return Read(new NonEquipmentExerciseRequestModel
            {
                p_action_type = "003",
                p_schedule_id = scheduleId
            });
        }

        public Response Add(NonEquipmentExerciseRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Non-equipment exercise added to schedule successfully.");
        }

        public Response Edit(NonEquipmentExerciseRequestModel req)
        {
            req.p_action_type = "005";
            return Exec(req, "Non-equipment exercise updated successfully.");
        }

        public Response UpdateStatus(int useId, string status)
        {
            return Exec(new NonEquipmentExerciseRequestModel
            {
                p_action_type = "006",
                p_use_id = useId,
                p_sub_status = status
            }, $"Exercise status updated to '{status}'.");
        }

        public Response Delete(int useId, int adminId)
        {
            return Exec(new NonEquipmentExerciseRequestModel
            {
                p_action_type = "007",
                p_use_id = useId,
                p_admin_id = adminId
            }, "Non-equipment exercise deleted successfully.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(NonEquipmentExerciseRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<NonEquipmentExerciseModel>();
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

        private Response Exec(NonEquipmentExerciseRequestModel req, string successMsg)
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

        // ADD this method for Admin Approvral 
        public Response Approve(int useId, string approvalStatus, int adminId)
        {
            return Exec(new NonEquipmentExerciseRequestModel
            {
                p_action_type = "006",
                p_use_id = useId,
                p_approval_status = approvalStatus,
                p_admin_id = adminId,
            }, $"Exercise {approvalStatus}.");
        }

        private NonEquipmentExerciseModel MapRow(DataRow row) =>
            new NonEquipmentExerciseModel
            {
                use_Id = row["use_Id"] != DBNull.Value
                               ? Convert.ToInt32(row["use_Id"]) : (int?)null,
                scheduleId = row["scheduleId"] != DBNull.Value
                               ? Convert.ToInt32(row["scheduleId"]) : (int?)null,
                exercise_Id = row["exercise_Id"] != DBNull.Value
                               ? Convert.ToInt32(row["exercise_Id"]) : (int?)null,
                sets = row["sets"] != DBNull.Value
                               ? Convert.ToInt32(row["sets"]) : (int?)null,
                reps = row["reps"] != DBNull.Value
                               ? Convert.ToInt32(row["reps"]) : (int?)null,
                sub_status = row["sub_status"]?.ToString(),
                exerciseName = row.Table.Columns.Contains("ExerciseName")
                               ? row["ExerciseName"]?.ToString() : null,
                muscleGroup = row.Table.Columns.Contains("MuscleGroup")
                               ? row["MuscleGroup"]?.ToString() : null
            };
    }
}