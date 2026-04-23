using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITimeSlot
    {
        Response GetAll();
        Response GetById(int timeslotId);
        Response Add(TimeSlotRequestModel req);
        Response Edit(TimeSlotRequestModel req);
        Response Delete(int timeslotId, int adminId);
    }
}
