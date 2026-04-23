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
            return new DeviceModel
            {
                DeviceId = row.Table.Columns.Contains("DeviceId") && row["DeviceId"] != DBNull.Value
                    ? Convert.ToInt32(row["DeviceId"]) : (int?)null,
                deviceId = row.Table.Columns.Contains("DeviceId") && row["DeviceId"] != DBNull.Value
                    ? Convert.ToInt32(row["DeviceId"]) : (int?)null,
                deviceName = row.Table.Columns.Contains("device_name") ? row["device_name"]?.ToString()
                    : row.Table.Columns.Contains("deviceName") ? row["deviceName"]?.ToString() : null,
                machineID = row.Table.Columns.Contains("MachineID") ? row["MachineID"]?.ToString() : null,
                place = row.Table.Columns.Contains("Place") ? row["Place"]?.ToString() : null,
                deviceType = row.Table.Columns.Contains("DeviceType") ? row["DeviceType"]?.ToString() : null,
                Is_Status = row.Table.Columns.Contains("is_status") ? row["is_status"]?.ToString() : null,
                description = row.Table.Columns.Contains("description") ? row["description"]?.ToString() 
                    : row.Table.Columns.Contains("Description") ? row["Description"]?.ToString() : null,
                created_date = row.Table.Columns.Contains("created_date") ? row["created_date"]?.ToString() : null,
                updated_date = row.Table.Columns.Contains("updated_date") ? row["updated_date"]?.ToString() : null,
            };
        }
    }
}