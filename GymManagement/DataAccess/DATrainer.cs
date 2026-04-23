using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace GymManagement.DataAccess
{
    public class DATrainer : ITrainer
    {
        private readonly string ProcName = "GYM_TRAINER_PROC";

        public Response GetAllTrainers()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new TrainerRequestModel { p_action_type = "001" };
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<TrainerModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapTrainer(row));
                    result.ResultSet = list; result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response GetTrainerById(int trainerId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new TrainerRequestModel { p_action_type = "002", p_trainer_id = trainerId };
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<TrainerModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapTrainer(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response GetTrainerByUserId(int userId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new TrainerRequestModel { p_action_type = "006", p_user_id = userId };
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<TrainerModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapTrainer(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response AddTrainer(TrainerRequestModel req)
        {
            req.p_action_type = "003";
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? "Trainer created." : res.ExceptionMessage;
            }
            return result;
        }

        public Response EditTrainer(TrainerRequestModel req)
        {
            req.p_action_type = "004";
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ExceptionMessage;
            }
            return result;
        }

        public Response DeleteTrainer(int trainerId, int adminId)
        {
            var result = new Response();
            var req = new TrainerRequestModel { p_action_type = "005", p_trainer_id = trainerId, p_admin_id = adminId };
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ExceptionMessage;
            }
            return result;
        }

        public Response GetAllActiveTimeslots()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new TrainerTimeSlotRequestModel { p_action_type = "001" };
                var res = db.ProcedureRead(req, "GYM_TRAINER_TIMESLOT_PROC");
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<TrainerTimeSlotModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        bool active = row.Table.Columns.Contains("isActive")
                                      && row["isActive"] != DBNull.Value
                                      && Convert.ToBoolean(row["isActive"]);
                        if (!active) continue;

                        list.Add(new TrainerTimeSlotModel
                        {
                            trainerTimeslot_Id = row["trainerTimeslot_Id"] != DBNull.Value ? Convert.ToInt32(row["trainerTimeslot_Id"]) : (int?)null,
                            trainer_Id = row["trainer_Id"] != DBNull.Value ? Convert.ToInt32(row["trainer_Id"]) : (int?)null,
                            day_of_week = row.Table.Columns.Contains("day_of_week") ? row["day_of_week"]?.ToString() : null,
                            selected_days = row.Table.Columns.Contains("selected_days") ? row["selected_days"]?.ToString() : null,
                            starttime = row.Table.Columns.Contains("starttime") ? row["starttime"]?.ToString() : null,
                            endtime = row.Table.Columns.Contains("endtime") ? row["endtime"]?.ToString() : null,
                            custom_starttime = row.Table.Columns.Contains("custom_starttime") ? row["custom_starttime"]?.ToString() : null,
                            custom_endtime = row.Table.Columns.Contains("custom_endtime") ? row["custom_endtime"]?.ToString() : null,
                            isActive = true,
                        });
                    }
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        private TrainerModel MapTrainer(DataRow row)
        {
            string SafeStr(string col) =>
                row.Table.Columns.Contains(col) && row[col] != DBNull.Value
                    ? row[col].ToString() : null;

            int? SafeInt(string col) =>
                row.Table.Columns.Contains(col) && row[col] != DBNull.Value
                    ? Convert.ToInt32(row[col]) : (int?)null;

            int? CalcAge(string dobStr)
            {
                if (string.IsNullOrWhiteSpace(dobStr)) return null;
                if (!DateTime.TryParse(dobStr, out var d)) return null;
                var today = DateTime.Today;
                int a = today.Year - d.Year;
                if (d.Date > today.AddYears(-a)) a--;
                return a;
            }

            var dobValue = SafeStr("date_of_birth");
            var ageFromSp = SafeInt("age");

            return new TrainerModel
            {
                trainerId = SafeInt("trainerId"),
                userId = SafeInt("userId"),
                experience_years = SafeInt("experience_years"),
                bio = SafeStr("bio"),
                qualifications = SafeStr("qualifications"),
                date_of_birth = dobValue,
                age = ageFromSp ?? CalcAge(dobValue),
                username = SafeStr("username"),
                firstName = SafeStr("firstName"),
                lastName = SafeStr("lastName"),
                email = SafeStr("email"),
                phone = SafeStr("phone"),
                gender = SafeStr("gender"),
                profile_image = SafeStr("profile_image"),
                status = SafeStr("status"),
            };
        }
    }
}