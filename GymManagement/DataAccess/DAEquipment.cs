using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;

namespace GymManagement.DataAccess
{
    public class DAEquipment : IEquipment
    {
        private readonly string ProcName = "GYM_EQUIPMENT_PROC";

        public Response GetAll()
        {
            return Read(new EquipmentRequestModel { p_action_type = "001" });
        }

        public Response GetById(int equipmentId)
        {
            return Read(new EquipmentRequestModel
            {
                p_action_type = "002",
                p_equipment_id = equipmentId
            });
        }

        public Response Add(EquipmentRequestModel req)
        {
            req.p_action_type = "003";
            return Exec(req, "Equipment added successfully.");
        }

        public Response Edit(EquipmentRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Equipment updated successfully.");
        }

        public Response Delete(int equipmentId, int adminId)
        {
            return Exec(new EquipmentRequestModel
            {
                p_action_type = "005",
                p_equipment_id = equipmentId,
                p_admin_id = adminId
            }, "Equipment deleted successfully.");
        }

        public Response Tag(int equipmentId, int rfidId)
        {
            return Exec(new EquipmentRequestModel
            {
                p_action_type = "006",
                p_equipment_id = equipmentId,
                p_rfid_id = rfidId
            }, "Equipment usage started.");
        }

        // ── Private Helpers ───────────────────────────────────────────
        private Response Read(EquipmentRequestModel req)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(req, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<EquipmentModel>();
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

        private Response Exec(EquipmentRequestModel req, string successMsg)
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

        private EquipmentModel MapRow(DataRow row) =>
            new EquipmentModel
            {
                equipmentId = row["equipmentId"] != DBNull.Value
                                ? Convert.ToInt32(row["equipmentId"]) : (int?)null,
                equipmentName = row["equipmentName"]?.ToString(),
                equipmentType = row["equipmentType"]?.ToString(),
                description = row["description"]?.ToString(),
                deviceId = row["deviceId"] != DBNull.Value
                                ? Convert.ToInt32(row["deviceId"]) : (int?)null,
                quantity = row.Table.Columns.Contains("quantity") && row["quantity"] != DBNull.Value
                                ? Convert.ToInt32(row["quantity"]) : (int?)null
            };
    }
}