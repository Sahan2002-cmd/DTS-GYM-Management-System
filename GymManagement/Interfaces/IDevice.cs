using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface IDevice
    {
        Response GetAllDevice();
        Response AddDevice(DeviceRequestModel req);
        Response EditDevice(DeviceRequestModel req);
        Response DeleteDevice(int deviceId, int adminId);
    }
}