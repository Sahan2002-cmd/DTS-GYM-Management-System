using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class DeviceModel
    {
        public int? DeviceId { get; set; }
        public int? deviceId { get; set; }
        public string deviceName { get; set; }
        public string deviceType { get; set; }
        public string location { get; set; }
        public string serialNumber { get; set; }
        public bool isActive { get; set; }
        public string machineID { get; set; }
        public string place { get; set; }
        public string EquipmentId { get; set; }
        public string description { get; set; }
        public string Is_Status { get; set; }
        public string created_date { get; set; }
        public string updated_date { get; set; }
        public int? created_by { get; set; }
        public int? updated_by { get; set; }
    }

    public class DeviceRequestModel : BaseRequestModel
    {
        public int? p_device_id { get; set; }
        public int? p_equipment_id { get; set; }
        public string p_description { get; set; }
        public int? p_admin_id { get; set; }
        public string p_status { get; set; }
        public string p_device_name { get; set; }
        public string p_device_type { get; set; }
        public string p_location { get; set; }
        public string p_serial_number { get; set; }
        public string p_machine_id { get; set; }
        public string p_place { get; set; }
        public int? p_is_active { get; set; }
    }
}