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
    public class DADevice : IDevice
    {
        private readonly string ProcName = "GYM_DEVICE_PROC";

        public Response GetAllDevice()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var req = new DeviceRequestModel { p_action_type = "001" };
                var res = db.ProcedureRead(req, ProcName);

                if (res.ResultStatusCode == "1")
                {
                    var list = new List<DeviceModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapDevice(row));
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

        public Response AddDevice(DeviceRequestModel req)
        {
            req.p_action_type = "003";
            return Exec(req, "Device added successfully.");
        }

        public Response EditDevice(DeviceRequestModel req)
        {
            req.p_action_type = "004";
            return Exec(req, "Device updated successfully.");
        }

        public Response DeleteDevice(int deviceId, int adminId)
        {
            return Exec(new DeviceRequestModel
            {
                p_action_type = "005",
                p_device_id = deviceId,
                p_admin_id = adminId
            }, "Device deleted.");
        }

        private Response Exec(DeviceRequestModel req, string successMsg)
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

        private DeviceModel MapDevice(DataRow row)
        {
            string SafeStr(params string[] cols) {
                foreach (var c in cols)
                    if (row.Table.Columns.Contains(c) && row[c] != DBNull.Value)
                        return row[c].ToString();
                return null;
            }
            int? SafeInt(params string[] cols) {
                foreach (var c in cols)
                    if (row.Table.Columns.Contains(c) && row[c] != DBNull.Value)
                        return Convert.ToInt32(row[c]);
                return null;
            }

            var id = SafeInt("deviceId", "DeviceId", "device_id");
            return new DeviceModel
            {
                DeviceId = id,
                deviceId = id,
                deviceName = SafeStr("device_name", "deviceName", "DeviceName"),
                machineID = SafeStr("machineID", "MachineID", "machine_id"),
                place = SafeStr("place", "Place", "installation_place"),
                deviceType = SafeStr("deviceType", "DeviceType", "type"),
                Is_Status = SafeStr("is_status", "Is_Status", "status"),
                description = SafeStr("description", "Description", "notes"),
                created_date = SafeStr("created_date", "CreatedDate"),
                updated_date = SafeStr("updated_date", "UpdatedDate"),
            };
        }
    }
}