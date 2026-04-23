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
            var cols = row.Table.Columns;
            
            int? deviceIdVal = null;
            if (cols.Contains("deviceId") && row["deviceId"] != DBNull.Value) deviceIdVal = Convert.ToInt32(row["deviceId"]);
            else if (cols.Contains("DeviceId") && row["DeviceId"] != DBNull.Value) deviceIdVal = Convert.ToInt32(row["DeviceId"]);
            else if (cols.Contains("device_id") && row["device_id"] != DBNull.Value) deviceIdVal = Convert.ToInt32(row["device_id"]);

            string name = null;
            if (cols.Contains("device_name")) name = row["device_name"]?.ToString();
            else if (cols.Contains("deviceName")) name = row["deviceName"]?.ToString();
            else if (cols.Contains("DeviceName")) name = row["DeviceName"]?.ToString();

            string mid = null;
            if (cols.Contains("machineID")) mid = row["machineID"]?.ToString();
            else if (cols.Contains("MachineID")) mid = row["MachineID"]?.ToString();
            else if (cols.Contains("machine_id")) mid = row["machine_id"]?.ToString();

            string p = null;
            if (cols.Contains("place")) p = row["place"]?.ToString();
            else if (cols.Contains("Place")) p = row["Place"]?.ToString();
            else if (cols.Contains("installation_place")) p = row["installation_place"]?.ToString();

            string type = null;
            if (cols.Contains("deviceType")) type = row["deviceType"]?.ToString();
            else if (cols.Contains("DeviceType")) type = row["DeviceType"]?.ToString();
            else if (cols.Contains("type")) type = row["type"]?.ToString();

            string status = null;
            if (cols.Contains("is_status")) status = row["is_status"]?.ToString();
            else if (cols.Contains("Is_Status")) status = row["Is_Status"]?.ToString();
            else if (cols.Contains("status")) status = row["status"]?.ToString();

            string desc = null;
            if (cols.Contains("description")) desc = row["description"]?.ToString();
            else if (cols.Contains("Description")) desc = row["Description"]?.ToString();
            else if (cols.Contains("notes")) desc = row["notes"]?.ToString();

            return new DeviceModel
            {
                DeviceId = deviceIdVal,
                deviceId = deviceIdVal,
                deviceName = name,
                machineID = mid,
                place = p,
                deviceType = type,
                Is_Status = status,
                description = desc,
                created_date = cols.Contains("created_date") ? row["created_date"]?.ToString() : null,
                updated_date = cols.Contains("updated_date") ? row["updated_date"]?.ToString() : null,
            };
        }
    }
}