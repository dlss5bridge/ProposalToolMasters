import React, { useContext, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Crown, X } from "lucide-react";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import "./ViewPlan.css";
function ViewPlan(props) {
  const navigate = useNavigate();

  const {

    activeOrganizationSubscriptionPlan,

  } = useContext(AuthContextProvider);
  const handleRedirectSubscription = async () => {
    props.setShowModal(false);
    // await ChoosePlanApiModelData();
    navigate("/ChoosePlan", {
      state: { organizationKeyId: props.activeOrganizationKeyId },
    });
  };

  const handleCloseModel = () => {
    props.setShowModal(false);
  };

  return (
    <>
      <Modal
        show={props.showModal}
        // onHide={handleCloseModel}
        centered
        size="md"
        dialogClassName="vp-dialog"
        contentClassName="vp-modal"
      >
        <button
          type="button"
          className="vp-close"
          aria-label="Close"
          onClick={() => {
            handleCloseModel();

          }}
        >
          <X size={18} strokeWidth={2} />
        </button>

        <Modal.Body className="vp-body">
          <span className="vp-icon" aria-hidden="true">
            <Crown size={26} strokeWidth={1.9} />
          </span>

          <h6 className="vp-title">Upgrade Plan</h6>

          {activeOrganizationSubscriptionPlan?.prepareContract && activeOrganizationSubscriptionPlan?.remainingESignatures < 0 && props?.moduleName !== undefined ? (
            <p className="vp-message">
              You have reached the monthly e-signature limit for your current plan. To increase your monthly e-signature quota, please upgrade your plan.
            </p>

          ) : (
            <p className="vp-message">
              This feature is not available with your current subscription. Please upgrade to access it.
            </p>
          )}
        </Modal.Body>

        <Modal.Footer className="vp-footer">
          <button
            onClick={handleCloseModel}
            type="button"
            class="vp-btn vp-btn--ghost"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
          <Button
            type="button"
            className="vp-btn vp-btn--primary"
            onClick={handleRedirectSubscription}
          >
            View Plan
            <ArrowRight size={16} strokeWidth={2.2} />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default ViewPlan;
