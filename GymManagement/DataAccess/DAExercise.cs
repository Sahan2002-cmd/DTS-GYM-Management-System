using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DAExercise : IExercise
    {
        private readonly string ProcName = "GYM_EXERCISE_PROC";

        public Response GetAll()
        {
            return Read(new ExerciseRequestModel { p_action_type = "001" });
        }

        public Response GetById(int exerciseId)
        {
            return Read(new ExerciseRequestModel
            {
                p_action_type = "002",
                p_exercise_id = exerciseId
            });
        }

        public Response Add(ExerciseRequestModel req)
        {
            req.p_action_type = "003";
            return Exec(req, "Exercise created successfully.");
        }

        public Response Edit(ExerciseRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Exercise updated successfully.");
        }

        public Response Delete(int exerciseId, int adminId)
        {
            return Exec(new ExerciseRequestModel
            {
                p_action_type = "005",
                p_exercise_id = exerciseId,
                p_admin_id = adminId
            }, "Exercise deleted successfully.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(ExerciseRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<ExerciseModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapRow(row));

                    result.ResultSet = list;
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

        private Response Exec(ExerciseRequestModel req, string successMsg)
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

        private ExerciseModel MapRow(DataRow row) =>
            new ExerciseModel
            {
                exerciseId = row["exerciseId"] != DBNull.Value
                               ? Convert.ToInt32(row["exerciseId"]) : (int?)null,
                ExerciseName = row["ExerciseName"]?.ToString(),
                MuscleGroup = row["MuscleGroup"]?.ToString(),
                description = row["description"]?.ToString()
            };
    }
}