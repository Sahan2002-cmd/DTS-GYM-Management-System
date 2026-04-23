using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class EquipmentModel
    {
        public int? equipmentId { get; set; }
        public string equipmentName { get; set; }
        public string equipmentType { get; set; }
        public string description { get; set; }
        public int? deviceId { get; set; }
        public int? quantity { get; set; }
    }

    public class EquipmentRequestModel : BaseRequestModel
    {
        public int? p_equipment_id { get; set; }
        public string p_equipment_name { get; set; }
        public string p_equipment_type { get; set; }
        public string p_description { get; set; }
        public int? p_device_id { get; set; }
        public int? p_quantity { get; set; }
        public int? p_admin_id { get; set; }
        public int? p_rfid_id { get; set; }
    }
}