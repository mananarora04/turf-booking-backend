const express = require('express');
const router = express.Router();
const SchTurf=require('../model/sch_truf');
const InfoTurf=require('../model/info_turf');
const UserProfile=require('../model/user_profile');
const moment = require('moment/moment');

router.post('/fetchavailableturfs',async(req,res)=>{
    try
    {
        var resp;
        req.body.bookingdate=moment(req.body.bookingdate).format("YYYY-MM-DD");
        var turflis=await SchTurf.find({schdate:req.body.bookingdate,'turftiming.status':"A"});
        if(turflis.length===0)
        {
            resp={"Status":"NA","Message":"No Turf Available For Booking"};
        }
        else
        {
            var resplis=[];
            for(var i=0;i<turflis.length;i++)
            {
                var timelis=[];
                for(var j=0;j<turflis[i].turftiming.length;j++)
                {
                    if(turflis[i].turftiming[j].time>=req.body.bookingtime && turflis[i].turftiming[j].status==="A")
                    {
                        timelis.push(turflis[i].turftiming[j]);
                    }
                }
                if(timelis.length>0)
                {
                    var infodtls=await InfoTurf.find({_id:turflis[i].turfid});
                    var obj={
                        turfname:infodtls[0].turfname,
                        turfid:turflis[i].turfid,
                        schdate:turflis[i].schdate,
                        turftiming:timelis    
                    };
                    resplis.push(obj);
                }     
            }
            if(resplis.length===0)
            {
                resp={"Status":"NA","Message":"No Turf Available For Booking"};
            }
            else
            {
                resp={"Status":"A","Message":"Turf Available","turflis":resplis};
            }           
        }
        res.status(200).json(resp);
    }
    catch(error){
        const resp={"Status":"Failed","Message":"Error in fetching Available Turves"};
        res.status(500).json(resp);
    }
})

let funcincludetime= (lis,time) =>
{
    for(var i=0;i<lis.length;i++)
    {   
        if(lis[i]===time)
        {
            return true;
        }
    }
    return false;
}

router.post('/savebooking',async(req,res)=>{
    try
    {
        var resp=null;
        const cstmrdtls= await UserProfile.find({userid:req.body.tokenid}); 
        if(cstmrdtls.length===0)
        {
            resp={"Status":"Failed","Message":"Booking Failed. Please Update Profile First."};
        }
        else
        {
            var turflis=await SchTurf.find({schdate:req.body.bookingdtls.schdate,turfid:req.body.bookingdtls.turfid});
            for(var i=0;i<turflis[0].turftiming.length;i++)
            {
                if(funcincludetime(req.body.bookingdtls.selectedtiming,turflis[0].turftiming[i].time))
                {
                    if(turflis[0].turftiming[i].status==="A")
                    {
                        turflis[0].turftiming[i].status="B";
                        turflis[0].turftiming[i].cstmrid=cstmrdtls[0]._id;
                    }
                    else
                    {
                        resp={"Status":"Failed","Message":"Booking Failed. Turf Slot For ".concat(turflis[0].turftiming[i].time).concat(" Already Booked")};
                        break;
                    }
                }
            }
            if(resp===null)
            {
                await turflis[0].save();
                resp={"Status":"Success","Message":"Turf Booked Succesfully"};
            }
        }
        res.status(200).json(resp);
    }
    catch(error){
        const resp={"Status":"Failed","Message":"Error in booking turf"};
        res.status(500).json(resp);
    }
})

// Cancel a booking (set status back to 'A' and remove cstmrid)
router.post('/cancelbooking', async (req, res) => {
    try {
        const { turfname, schdate, time, userid } = req.body;
        // Find user profile to get cstmrid
        const user = await UserProfile.findOne({ userid });
        if (!user) {
            return res.status(400).json({ Status: 'Failed', Message: 'User not found' });
        }
        // Find turf info to get turfid
        const turfinfo = await InfoTurf.findOne({ turfname });
        if (!turfinfo) {
            return res.status(400).json({ Status: 'Failed', Message: 'Turf not found' });
        }
        // Find scheduled turf for the date and turf
        const schTurf = await SchTurf.findOne({ turfid: turfinfo._id.toString(), schdate });
        if (!schTurf) {
            return res.status(400).json({ Status: 'Failed', Message: 'Booking not found' });
        }
        // Find the timing slot
        const slot = schTurf.turftiming.find(t => t.time === time && t.cstmrid === user._id.toString());
        if (!slot) {
            return res.status(400).json({ Status: 'Failed', Message: 'Slot not found or not booked by user' });
        }
        // Only allow cancel if status is 'B' (Booked)
        if (slot.status !== 'B') {
            return res.status(400).json({ Status: 'Failed', Message: 'Slot is not booked' });
        }
        slot.status = 'A';
        slot.cstmrid = undefined;
        await schTurf.save();
        return res.status(200).json({ Status: 'Success', Message: 'Booking cancelled successfully' });
    } catch (error) {
        return res.status(500).json({ Status: 'Failed', Message: 'Error cancelling booking' });
    }
});

module.exports = router;