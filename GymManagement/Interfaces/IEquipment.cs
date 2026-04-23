using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface IEquipment
    {
        Response GetAll();
        Response GetById(int equipmentId);
        Response Add(EquipmentRequestModel req);
        Response Edit(EquipmentRequestModel req);
        Response Delete(int equipmentId, int adminId);
        Response Tag(int equipmentId, int rfidId);
    }
}