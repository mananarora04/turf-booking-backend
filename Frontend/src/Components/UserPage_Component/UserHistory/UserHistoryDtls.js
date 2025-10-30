import React from 'react'

class UserHistoryDtls extends React.Component {
    constructor(props) {
        super(props);
        this.state={
        };   
    }

    // Add this method to handle booking deletion
    async handleDeleteBooking(obj) {
        // Call backend API to cancel booking
        const resp = await fetch('/bookturf/cancelbooking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                turfname: obj.turfname,
                schdate: obj.schdate,
                time: obj.time,
                userid: this.props.cred.userid
            })
        }).then(res => res.json());
        if (resp.Status === 'Success') {
            // Remove the booking from the list (or refetch)
            if (this.props.onBookingDeleted) this.props.onBookingDeleted(obj);
        } else {
            if (this.props.setalertboxcontent) this.props.setalertboxcontent({ title: 'Delete Booking', body: resp.Message });
        }
    }

    render() {
        return (
            <>
            <div className="infodtls">
                <div style={{textAlign:"center"}}>
                    <h3>User History</h3>
                </div>
                <br/><br/>
                <div>
                    <table className="table centeralign table-bordered text-center">
                        <thead>
                            <tr style={{backgroundColor:"#FFF0F5"}}>
                                <td>Turf Name</td>
                                <td>Date</td>
                                <td>Time</td>
                                <td>Price</td>
                                <td>Status</td>
                                <td>Delete</td>
                            </tr>
                        </thead>  
                        <tbody>
                                {this.props.userhistorydtls.map((obj,i)=> (
                                    <tr Key={i} style={{backgroundColor:"ghostwhite"}}>
                                        <td>{obj.turfname}</td>
                                        <td>{obj.schdate}</td>
                                        <td>{obj.time}</td>
                                        <td>{obj.price}</td>
                                        <td>{obj.status}</td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => this.handleDeleteBooking(obj)} disabled={obj.status!=="Scheduled"}>Delete</button>
                                        </td>
                                    </tr>
                                ))} 
                        </tbody>
                    </table>
                </div>
            </div>
            </>
            );   
    }
  }

export default UserHistoryDtls;