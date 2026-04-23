// ============================================================
//  File : DataAccess/DARfidTag.cs  (UPDATED)
//  Changes: Added ToggleStatus (action 006) and GetByMember
//  NOTE: Previous action 006 was AssignToMember — it is now 007.
//        Update GYM_RFIDTAG_PROC in SQL accordingly (see SQL fixes).
// ============================================================
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DARfidTag : IRfidTag
    {
        private readonly string ProcName = "GYM_RFIDTAG_PROC";

        public Response GetAll()
            => Read(new RfidTagRequestModel { p_action_type = "001" });

        public Response GetById(int rfidId)
            => Read(new RfidTagRequestModel { p_action_type = "002", p_rfid_id = rfidId });

        // *** NEW: Get RFID tags by member ***
        public Response GetByMember(int memberId)
            => Read(new RfidTagRequestModel { p_action_type = "008", p_member_id = memberId });

        public Response Add(RfidTagRequestModel req)
        {
            req.p_action_type = "003";
            return Exec(req, "RFID tag added successfully.");
        }

        public Response Edit(RfidTagRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "RFID tag updated successfully.");
        }

        public Response Delete(int rfidId, int adminId)
            => Exec(new RfidTagRequestModel
            {
                p_action_type = "005",
                p_rfid_id = rfidId,
                p_admin_id = adminId
            }, "RFID tag deleted successfully.");

        // *** NEW: Toggle active/inactive status ***
        public Response ToggleStatus(int rfidId, int adminId)
            => Exec(new RfidTagRequestModel
            {
                p_action_type = "006",
                p_rfid_id = rfidId,
                p_admin_id = adminId
            }, "RFID tag status toggled.");

        public Response AssignToMember(int rfidId, int memberId, int adminId)
            => Exec(new RfidTagRequestModel
            {
                p_action_type = "007",   // was 006, now 007
                p_rfid_id = rfidId,
                p_admin_id = adminId
            }, "RFID tag assigned to member successfully.");

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(RfidTagRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<RfidTagModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapRow(row));
                    result.ResultSet = list.Count == 1 ? (object)list[0] : list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        private Response Exec(RfidTagRequestModel req, string successMsg)
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

        private RfidTagModel MapRow(DataRow row) => new RfidTagModel
        {
            rfId_Id = row.Table.Columns.Contains("rfId_Id") && row["rfId_Id"] != DBNull.Value
                            ? Convert.ToInt32(row["rfId_Id"]) : (int?)null,
            issueDate = row.Table.Columns.Contains("issueDate") ? row["issueDate"]?.ToString() : null,
            isActive = row.Table.Columns.Contains("isActive") && row["isActive"] != DBNull.Value
                            ? Convert.ToBoolean(row["isActive"]) : (bool?)null,
            rfid_number = row.Table.Columns.Contains("rfid_number") ? row["rfid_number"]?.ToString() : null,
            deviceId = row.Table.Columns.Contains("deviceId") && row["deviceId"] != DBNull.Value
                            ? Convert.ToInt32(row["deviceId"]) : (int?)null,
            is_status = row.Table.Columns.Contains("is_status") ? row["is_status"]?.ToString() : null
        };
    }
}
