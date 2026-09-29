import React, { useContext, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import errorImage from "../assets/images/gif/wired-outline-1140-error.gif";
import { useNavigate } from "react-router-dom";
import { AuthContextProvider } from "../AuthContext/AuthContext";
function ViewPlan(props) {
  const navigate = useNavigate();

  const {

    activeOrganizationSubscriptionPlan,

  } = useContext(AuthContextProvider);
  const remainingEL = Number(
    activeOrganizationSubscriptionPlan?.remainingESignatures,
);

const hasNoRemainingEL = remainingEL <= 0;

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
      >
        <Modal.Header >

          <h6>Upgrade Plan</h6>
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              handleCloseModel();

            }}
          ></button>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <img src={errorImage} alt="error_Img" height="70px" width="70px" />
          </div>
          {activeOrganizationSubscriptionPlan?.prepareContract && hasNoRemainingEL && props?.moduleName !== undefined ? (
            <p className="text-center mb-3">
              You have reached the monthly e-signature limit for your current plan. To increase your monthly e-signature quota, please upgrade your plan.
            </p>

          ) : (
            <p className="text-center mb-3">
              This feature is not available with your current subscription. Please upgrade to access it.
            </p>
          )}


        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={handleCloseModel}
            type="button"
            class="btn btn-md btn-light cancel-item-btn"
            data-bs-dismiss="modal"
          ></button>
          <Button
            type="button"
            className="btn btn-md btn-success create-item-btn p-8"
            onClick={handleRedirectSubscription}
          >
            View Plan
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default ViewPlan;
