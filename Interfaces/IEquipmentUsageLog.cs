using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface IEquipmentUsageLog
    {
        Response GetAll();
        Response GetById(int logId);
        Response GetByMember(int memberId);
        Response GetByDevice(int deviceId);
        Response StartUsage(EquipmentUsageLogRequestModel req);
        Response EndUsage(int logId, string endtime, int actualMins);
        Response GetActiveLogs();
    }
}
