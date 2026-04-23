using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DAPlan : IPlan
    {
        private readonly string ProcName = "GYM_PLAN_PROC";

        public Response GetAll()
        {
            return Read(new PlanRequestModel { p_action_type = "001" });
        }

        public Response GetById(int planId)
        {
            return Read(new PlanRequestModel
            {
                p_action_type = "002",
                p_plan_id = planId
            });
        }

        public Response Add(PlanRequestModel req)
        {
            req.p_action_type = "003";
            return Exec(req, "Plan created successfully.");
        }

        public Response Edit(PlanRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Plan updated successfully.");
        }

        public Response Delete(int planId, int adminId)
        {
            return Exec(new PlanRequestModel
            {
                p_action_type = "005",
                p_plan_id = planId,
                p_admin_id = adminId
            }, "Plan deleted successfully.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(PlanRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<PlanModel>();
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

        private Response Exec(PlanRequestModel req, string successMsg)
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

        private PlanModel MapRow(DataRow row) =>
            new PlanModel
            {
                planId = row["planId"] != DBNull.Value
                                ? Convert.ToInt32(row["planId"]) : (int?)null,
                planType = row["planType"]?.ToString(),
                duration_days = row["duration_days"] != DBNull.Value
                                ? Convert.ToInt32(row["duration_days"]) : (int?)null,
                price = row["price"] != DBNull.Value
                                ? Convert.ToDecimal(row["price"]) : (decimal?)null
            };
    }
}