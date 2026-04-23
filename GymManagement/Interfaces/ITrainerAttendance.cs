using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITrainerAttendance
    {
        Response GetAll();
        Response GetByTrainer(int trainerId);
        Response GetByDateRange(string dateFrom, string dateTo);
        Response CheckIn(int trainerId);
        Response CheckOut(int trainerId);
        Response GetTodayAttendance();
    }
}
