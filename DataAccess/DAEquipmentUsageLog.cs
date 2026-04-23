using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace GymManagement.DataAccess
{
    public class DAEquipmentUsageLog : IEquipmentUsageLog
    {
        private readonly string ProcName = "GYM_EQUIPMENT_USAGE_LOG_PROC";

        public Response GetAll() => Read(new EquipmentUsageLogRequestModel { p_action_type = "001" });
        public Response GetByMember(int mid) => Read(new EquipmentUsageLogRequestModel { p_action_type = "003", p_member_id = mid });
        public Response GetByDevice(int did) => Read(new EquipmentUsageLogRequestModel { p_action_type = "004", p_device_id = did });
        public Response GetActiveLogs() => Read(new EquipmentUsageLogRequestModel { p_action_type = "005" });

        public Response GetById(int logId) => Read(new EquipmentUsageLogRequestModel { p_action_type = "002", p_log_id = logId });

        // Triggered when member scans RFID on equipment scanner
        public Response StartUsage(EquipmentUsageLogRequestModel req)
        {
            req.p_action_type = "006";
            req.p_starttime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            req.p_status = "in_progress";
            return Exec(req, "Equipment usage started.");
        }

        // Triggered when member scans RFID to end session
        public Response EndUsage(int logId, string endtime, int actualMins)
        {
            return Exec(new EquipmentUsageLogRequestModel
            {
                p_action_type = "007",
                p_log_id = logId,
                p_endtime = endtime,
                p_actual_mins = actualMins,
                p_status = "completed"
            }, "Equipment usage ended.");
        }

        private Response Read(EquipmentUsageLogRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<EquipmentUsageLogModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(new EquipmentUsageLogModel
                        {
                            logId = Convert.ToInt32(row["LogId"]),
                            rfid_Id = Convert.ToInt32(row["rfid_Id"]),
                            ea_Id = Convert.ToInt32(row["ea_Id"]),
                            device_Id = Convert.ToInt32(row["device_Id"]),
                            starttime = row["starttime"]?.ToString(),
                            endtime = row["endtime"]?.ToString(),
                            actual_mins = row["actual_mins"] != DBNull.Value ? Convert.ToInt32(row["actual_mins"]) : (int?)null,
                            status = row["status"]?.ToString(),
                            memberName = row.Table.Columns.Contains("memberName") ? row["memberName"]?.ToString() : null,
                            equipmentName = row.Table.Columns.Contains("equipmentName") ? row["equipmentName"]?.ToString() : null
                        });
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        private Response Exec(EquipmentUsageLogRequestModel req, string msg)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? msg : res.ExceptionMessage;
            }
            return result;
        }
    }
}