using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ISchedule
    {
        Response GetAll();
        Response GetById(int scheduleId);
        Response GetByMember(int memberId);
        Response GetByTrainer(int trainerId);
        Response GetByDate(string scheduleDate);
        Response Add(ScheduleRequestModel req);
        Response Edit(ScheduleRequestModel req);
        Response UpdateStatus(int scheduleId, string status, string reason);
        Response Delete(int scheduleId, int adminId);
    }
}
