using System;

namespace GymManagement.Models
{
    // ── Read model (returned from SP) ──────────────────────────
    public class ParQModel
    {
        public int? parqId { get; set; }
        public int? userId { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
        public string email { get; set; }
        public string phone { get; set; }
        public string roleName { get; set; }

        // The 7 PAR-Q questions  (false = No, true = Yes)
        public bool q1_heart_condition { get; set; }
        public bool q2_chest_pain_activity { get; set; }
        public bool q3_chest_pain_rest { get; set; }
        public bool q4_dizziness { get; set; }
        public bool q5_bone_joint { get; set; }
        public bool q6_bp_medication { get; set; }
        public bool q7_other_reason { get; set; }
        public string q7_other_details { get; set; }

        public bool physician_clearance { get; set; }
        public bool has_risk_flag { get; set; }   // computed by SP

        public string submitted_date { get; set; }
        public string updated_date { get; set; }
    }

    // ── Request model (sent to SP) ─────────────────────────────
    public class ParQRequestModel : BaseRequestModel
    {
        public int? p_user_id { get; set; }
        public bool? p_q1 { get; set; }
        public bool? p_q2 { get; set; }
        public bool? p_q3 { get; set; }
        public bool? p_q4 { get; set; }
        public bool? p_q5 { get; set; }
        public bool? p_q6 { get; set; }
        public bool? p_q7 { get; set; }
        public string p_q7_details { get; set; }
        public bool? p_physician_clearance { get; set; }
    }
}