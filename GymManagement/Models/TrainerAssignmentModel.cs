using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class TrainerAssignmentModel
    {
        public int? assignmentId { get; set; }
        public int? trainerId { get; set; }
        public int? memberId { get; set; }
        public string assignment_date { get; set; }
        public string status { get; set; }
        public string trainerName { get; set; }
        public string memberName { get; set; }
    }

    public class TrainerAssignmentRequestModel : BaseRequestModel
    {
        public int? p_assignment_id { get; set; }
        public int? p_trainer_id { get; set; }
        public int? p_member_id { get; set; }
        public string p_assignment_date { get; set; }
        public string p_status { get; set; }
        public int? p_admin_id { get; set; }
    }
}