import React from 'react';

function AlertBox({ isOpen, onClose, alertboxcontent }) {
    if (!isOpen) return null;
    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title" style={{ textAlign: 'center' }}>{alertboxcontent.title}</h4>
                    </div>
                    <div className="modal-body">
                        <h4 style={{ textAlign: 'center' }}>{alertboxcontent.body}</h4>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default AlertBox;