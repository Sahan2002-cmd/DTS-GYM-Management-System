using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace GymManagement.DataAccess
{
    public class DASubscription : ISubscription
    {
        private readonly string ProcName = "GYM_SUBSCRIPTION_PROC";

        public Response GetAll() => Read(new SubscriptionRequestModel { p_action_type = "001" });
        public Response GetActiveSubscriptions() => Read(new SubscriptionRequestModel { p_action_type = "006" });

        public Response GetById(int id) => Read(new SubscriptionRequestModel { p_action_type = "002", p_subscription_id = id });
        public Response GetByMember(int mid) => Read(new SubscriptionRequestModel { p_action_type = "003", p_member_id = mid });

        public Response Add(SubscriptionRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Subscription created.");
        }

        public Response Edit(SubscriptionRequestModel req)
        {
            req.p_action_type = "005";
            return Exec(req, "Subscription updated.");
        }

        public Response Deactivate(int id, int adminId)
        {
            return Exec(new SubscriptionRequestModel
            {
                p_action_type = "007",
                p_subscription_id = id,
                p_admin_id = adminId
            }, "Subscription deactivated.");
        }


        // ADD this method:
        public Response Activate(int subscriptionId, int adminId)
        {
            return Exec(new SubscriptionRequestModel
            {
                p_action_type = "008",
                p_subscription_id = subscriptionId,
                p_admin_id = adminId,
            }, "Subscription activated.");
        }



        private Response Read(SubscriptionRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<SubscriptionModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(new SubscriptionModel
                        {
                            subscriptionId = Convert.ToInt32(row["subscriptionId"]),
                            memberId = Convert.ToInt32(row["memberId"]),
                            planId = Convert.ToInt32(row["planId"]),
                            trainer_Id = row["trainer_Id"] != DBNull.Value ? Convert.ToInt32(row["trainer_Id"]) : (int?)null,
                            startDate = row["startDate"]?.ToString(),
                            end_date = row["end_date"]?.ToString(),
                            is_active = Convert.ToBoolean(row["is_active"]),
                            planType = row.Table.Columns.Contains("planType") ? row["planType"]?.ToString() : null,
                            memberName = row.Table.Columns.Contains("memberName") ? row["memberName"]?.ToString() : null
                        });
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        private Response Exec(SubscriptionRequestModel req, string successMsg)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? successMsg : res.ExceptionMessage;
            }
            return result;
        }
    }
}