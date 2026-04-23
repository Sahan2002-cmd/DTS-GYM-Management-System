using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DAParQ : IParQ
    {
        private readonly string ProcName = "GYM_PARQ_PROC";

        // ── GET ALL  (Admin) ────────────────────────────────────
        public Response GetAll()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(
                    new ParQRequestModel { p_action_type = "001" }, ProcName);

                if (res.ResultStatusCode == "1")
                {
                    var list = new List<ParQModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(Map(row));
                    result.StatusCode = 200;
                    result.ResultSet = list;
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        // ── GET BY USER ID  (Member own / Trainer checking one member) ──
        public Response GetByUserId(int userId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(
                    new ParQRequestModel { p_action_type = "002", p_user_id = userId }, ProcName);

                if (res.ResultStatusCode == "1")
                {
                    if (res.ResultDataTable.Rows.Count > 0)
                    {
                        result.StatusCode = 200;
                        result.ResultSet = Map(res.ResultDataTable.Rows[0]);
                    }
                    else
                    {
                        result.StatusCode = 200;
                        result.ResultSet = null;    // no record yet — that's fine
                        result.Result = "No PAR-Q submitted yet.";
                    }
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        // ── GET ALL FOR TRAINER'S MEMBERS ──────────────────────
        public Response GetByTrainerId(int trainerId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(
                    new ParQRequestModel { p_action_type = "004", p_user_id = trainerId }, ProcName);

                if (res.ResultStatusCode == "1")
                {
                    var list = new List<ParQModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(Map(row));
                    result.StatusCode = 200;
                    result.ResultSet = list;
                }
                else
                {
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }
            }
            return result;
        }

        // ── SAVE (INSERT or UPDATE) ─────────────────────────────
        public Response Save(ParQRequestModel req)
        {
            req.p_action_type = "003";
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                return new Response
                {
                    StatusCode = res.ResultStatusCode == "1" ? 200 : 500,
                    Result = res.ResultStatusCode == "1"
                                 ? "PAR-Q saved successfully."
                                 : res.ExceptionMessage
                };
            }
        }

        // ── Row mapper ──────────────────────────────────────────
        private static ParQModel Map(DataRow row)
        {
            bool Col(string name)
            {
                if (!row.Table.Columns.Contains(name)) return false;
                var v = row[name];
                if (v == DBNull.Value) return false;
                if (v is bool b) return b;
                return Convert.ToInt32(v) == 1;
            }

            return new ParQModel
            {
                parqId = row.Table.Columns.Contains("parqId") && row["parqId"] != DBNull.Value ? Convert.ToInt32(row["parqId"]) : (int?)null,
                userId = row.Table.Columns.Contains("userId") && row["userId"] != DBNull.Value ? Convert.ToInt32(row["userId"]) : (int?)null,
                firstName = row.Table.Columns.Contains("firstName") && row["firstName"] != DBNull.Value ? row["firstName"].ToString() : null,
                lastName = row.Table.Columns.Contains("lastName") && row["lastName"] != DBNull.Value ? row["lastName"].ToString() : null,
                email = row.Table.Columns.Contains("email") && row["email"] != DBNull.Value ? row["email"].ToString() : null,
                phone = row.Table.Columns.Contains("phone") && row["phone"] != DBNull.Value ? row["phone"].ToString() : null,
                roleName = row.Table.Columns.Contains("roleName") && row["roleName"] != DBNull.Value ? row["roleName"].ToString() : null,
                q1_heart_condition = Col("q1_heart_condition"),
                q2_chest_pain_activity = Col("q2_chest_pain_activity"),
                q3_chest_pain_rest = Col("q3_chest_pain_rest"),
                q4_dizziness = Col("q4_dizziness"),
                q5_bone_joint = Col("q5_bone_joint"),
                q6_bp_medication = Col("q6_bp_medication"),
                q7_other_reason = Col("q7_other_reason"),
                q7_other_details = row.Table.Columns.Contains("q7_other_details") && row["q7_other_details"] != DBNull.Value ? row["q7_other_details"].ToString() : null,
                physician_clearance = Col("physician_clearance"),
                has_risk_flag = Col("has_risk_flag"),
                submitted_date = row.Table.Columns.Contains("submitted_date") && row["submitted_date"] != DBNull.Value ? row["submitted_date"].ToString() : null,
                updated_date = row.Table.Columns.Contains("updated_date") && row["updated_date"] != DBNull.Value ? row["updated_date"].ToString() : null,
            };
        }
    }
}