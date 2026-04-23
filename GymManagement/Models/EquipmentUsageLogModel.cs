using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class EquipmentUsageLogModel
    {
        public int? logId { get; set; }
        public int? rfid_Id { get; set; }
        public int? ea_Id { get; set; }
        public int? device_Id { get; set; }
        public string starttime { get; set; }
        public string endtime { get; set; }
        public int? actual_mins { get; set; }
        public string status { get; set; }
        public string memberName { get; set; }
        public string equipmentName { get; set; }
    }
    public class EquipmentUsageLogRequestModel : BaseRequestModel
    {
        public int? p_log_id { get; set; }
        public int? p_rfid_id { get; set; }
        public int? p_ea_id { get; set; }
        public int? p_device_id { get; set; }
        public string p_starttime { get; set; }
        public string p_endtime { get; set; }
        public int? p_actual_mins { get; set; }
        public string p_status { get; set; }
        public int? p_member_id { get; set; }
    }
}