using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;
namespace GymManagement.Interfaces
{
    public interface IReport
    {
        Response MemberReport(string dateFrom, string dateTo);
        Response TrainerReport(string dateFrom, string dateTo);
        Response UserReport(string dateFrom, string dateTo);
        Response AttendanceReport(int? memberId, string dateFrom, string dateTo);
        Response SubscriptionReport(string dateFrom, string dateTo);
        Response PaymentReport(string dateFrom, string dateTo);
        Response ExportToPdf(string reportType, string dateFrom,string dateTo, int? memberId);
    }
}
