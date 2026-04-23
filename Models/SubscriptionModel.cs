using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class SubscriptionModel
    {
        public int? subscriptionId { get; set; }
        public int? memberId { get; set; }
        public int? planId { get; set; }
        public int? trainer_Id { get; set; }
        public string startDate { get; set; }
        public string end_date { get; set; }
        public bool? is_active { get; set; }
        public string planType { get; set; }
        public string memberName { get; set; }

    }

    public class SubscriptionRequestModel : BaseRequestModel
    {
        public int? p_subscription_id { get; set; }
        public int? p_member_id { get; set; }
        public int? p_plan_id { get; set; }
        public int? p_trainer_id { get; set; }
        public string p_start_date { get; set; }
        public string p_end_date { get; set; }
        public int? p_is_active { get; set; }
        public int? p_admin_id { get; set; }
        public new string p_action_type { get; set; }
    }
}