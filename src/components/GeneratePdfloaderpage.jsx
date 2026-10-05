import React from "react";
import acceptInviteIMG from "../assets/images/accept-invite.jpg";
import { Row, Col, Card, CardBody } from "reactstrap";

function GeneratePdfLoaderPage(props) {
  return (
    <React.Fragment>
      <div className="authentication-bg d-flex align-items-center pb-0 vh-100">
        <div className="content-center w-100">
          <div className="container">
            <Card className="mo-mt-2">
              <CardBody>
                <Row className="align-items-center">
                  <Col lg="6" className="ml-auto">
                    <div className="ex-page-content text-center">
                      {/* <h4>Generating Your Engagement Letter</h4> */}
                      <h4 className="mb-4">
                        {props.message == null || props.message == ""
                          ? `Generating Your Engagement Letter`
                          : props.message}{" "}
                      </h4>
                      {/* No message still shows the spinner (unchanged
                          default). A message normally hides it (today's
                          error-message look), but a caller can pass
                          showSpinner to keep it for an informational status
                          message instead, e.g. "Redirecting you to payment...". */}
                      {props.message == null ||
                      props.message == "" ||
                      props.showSpinner === true ? (
                        <>
                          <div
                            style={{
                              justifyContent: "center",
                            }}
                            className="mb-4 d-flex"
                          >
                            <svg
                              viewBox="0 0 100 100"
                              preserveAspectRatio="xMidYMid"
                              width="50"
                              height="50"
                              style={{
                                shapeRendering: "auto",
                                display: "block",
                                background: "rgb(255, 255, 255)",
                              }}
                            >
                              <g>
                                <rect
                                  fill="#009fe5"
                                  height="40"
                                  width="15"
                                  y="30"
                                  x="17.5"
                                >
                                  <animate
                                    begin="-0.2s"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                                    values="18;30;30"
                                    keyTimes="0;0.5;1"
                                    calcMode="spline"
                                    dur="1s"
                                    repeatCount="indefinite"
                                    attributeName="y"
                                  ></animate>
                                  <animate
                                    begin="-0.2s"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                                    values="64;40;40"
                                    keyTimes="0;0.5;1"
                                    calcMode="spline"
                                    dur="1s"
                                    repeatCount="indefinite"
                                    attributeName="height"
                                  ></animate>
                                </rect>
                                <rect
                                  fill="#3ba098"
                                  height="40"
                                  width="15"
                                  y="30"
                                  x="42.5"
                                >
                                  <animate
                                    begin="-0.1s"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                                    values="20.999999999999996;30;30"
                                    keyTimes="0;0.5;1"
                                    calcMode="spline"
                                    dur="1s"
                                    repeatCount="indefinite"
                                    attributeName="y"
                                  ></animate>
                                  <animate
                                    begin="-0.1s"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                                    values="58.00000000000001;40;40"
                                    keyTimes="0;0.5;1"
                                    calcMode="spline"
                                    dur="1s"
                                    repeatCount="indefinite"
                                    attributeName="height"
                                  ></animate>
                                </rect>
                                <rect
                                  fill="#122549"
                                  height="40"
                                  width="15"
                                  y="30"
                                  x="67.5"
                                >
                                  <animate
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                                    values="20.999999999999996;30;30"
                                    keyTimes="0;0.5;1"
                                    calcMode="spline"
                                    dur="1s"
                                    repeatCount="indefinite"
                                    attributeName="y"
                                  ></animate>
                                  <animate
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1"
                                    values="58.00000000000001;40;40"
                                    keyTimes="0;0.5;1"
                                    calcMode="spline"
                                    dur="1s"
                                    repeatCount="indefinite"
                                    attributeName="height"
                                  ></animate>
                                </rect>
                              </g>
                            </svg>
                          </div>
                          <div style={{ color: "#6c757d" }}>
                            <b>Please wait</b>
                          </div>
                          <div style={{ color: "#6c757d", fontSize: "12px" }}>
                            Do not refresh page{" "}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </Col>
                  <Col lg="6" className="mx-auto">
                    <img
                      src={acceptInviteIMG}
                      alt="acceptInviteIMG"
                      className="img-fluid mx-auto d-block"
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default GeneratePdfLoaderPage;
