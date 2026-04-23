using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GymManagement.Models
{
    public class PlanModel
    {
        public int? planId { get; set; }
        public string planType { get; set; }
        public int? duration_days { get; set; }
        public decimal? price { get; set; }
    }

    public class PlanRequestModel : BaseRequestModel
    {
        public int? p_plan_id { get; set; }
        public string p_plan_type { get; set; }
        public int? p_duration_days { get; set; }
        public decimal? p_price { get; set; }
        public int? p_admin_id { get; set; }
    }
}