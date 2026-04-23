using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IAttendance
    {
        Response GetAll();
        Response GetByMember(int memberId);
        Response GetByDateRange(string dateFrom, string dateTo);
        Response CheckIn(int rfidId);
        Response CheckOut(int rfidId);
        Response GetTodayAttendance();
    }
}
