using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class EquipmentAssignmentModel
    {
        public int? ea_Id { get; set; }
        public int? equipmentId { get; set; }
        public int? scheduleId { get; set; }
        public int? trainerId { get; set; }
        public int? memberId { get; set; }
        public int? target_mins { get; set; }
        public string equipmentName { get; set; }
        public string memberName { get; set; }
    }
    public class EquipmentAssignmentRequestModel : BaseRequestModel
    {
        public int? p_ea_id { get; set; }
        public int? p_equipment_id { get; set; }
        public int? p_schedule_id { get; set; }
        public int? p_trainer_id { get; set; }
        public int? p_member_id { get; set; }
        public int? p_target_mins { get; set; }
        public int? p_admin_id { get; set; }
    }
}