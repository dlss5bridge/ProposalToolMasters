/* global $ */
import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AuthContextProvider } from "../AuthContext/AuthContext";
import {
  GetProposalDesignTheme,
  UpdateProposalDesignTheme,
} from "../redux/Services/Setting/ProposalDesignThemeApi";
import "./ProposalThemeSettingModal.css";

/*
 * Super Admin > Settings > Proposal Theme.
 *
 * Lets the Super Admin pick which Select Services design (Theme 1-4) is
 * currently live on the Add/Update Proposal and Add/Update Engagement
 * Letter screens, for every organisation. This is the ONLY place that
 * setting is changed - it is not per-user or per-organisation.
 *
 * The previews below are small illustrative mockups (plain boxes standing
 * in for each layout's shape), not live copies of the real screens - the
 * real components assume a full page of proposal data and handlers that
 * don't make sense to fake inside a small modal. If you'd rather see the
 * real, interactive components in miniature, that's a separate, heavier
 * piece of work - say so and it can be built next.
 */

const THEME_OPTIONS = [
  {
    id: 1,
    name: "Theme 1 - Classic",
    description:
      "The original layout: services listed in two plain columns with checkboxes and inline pricing fields.",
  },
  {
    id: 2,
    name: "Theme 2 - Accordion & Summary",
    description:
      "Recurring and one-off services in collapsible category accordions, with a running selection summary alongside.",
  },
  {
    id: 3,
    name: "Theme 3 - Category Rail",
    description:
      "Categories listed in a side rail; picking one shows its services as selectable cards, with a summary panel.",
  },
  {
    id: 4,
    name: "Theme 4 - Flowing Cards",
    description:
      "Every category shown at once as its own card, services as pill buttons, with a selection summary alongside.",
  },
];

const ThemePreview = ({ themeId }) => {
  if (themeId === 1) {
    return (
      <div className="pts-preview pts-preview--1" aria-hidden="true">
        <span className="pts-preview__row pts-preview__row--head" />
        <span className="pts-preview__row" />
        <span className="pts-preview__row" />
        <span className="pts-preview__row pts-preview__row--head" />
        <span className="pts-preview__row" />
      </div>
    );
  }
  if (themeId === 2) {
    return (
      <div className="pts-preview pts-preview--2" aria-hidden="true">
        <div className="pts-preview__col">
          <span className="pts-preview__bar pts-preview__bar--open" />
          <span className="pts-preview__bar" />
          <span className="pts-preview__bar" />
        </div>
        <div className="pts-preview__side" />
      </div>
    );
  }
  if (themeId === 3) {
    return (
      <div className="pts-preview pts-preview--3" aria-hidden="true">
        <div className="pts-preview__rail">
          <span className="pts-preview__dot pts-preview__dot--active" />
          <span className="pts-preview__dot" />
          <span className="pts-preview__dot" />
        </div>
        <div className="pts-preview__grid">
          <span className="pts-preview__tile" />
          <span className="pts-preview__tile" />
          <span className="pts-preview__tile" />
          <span className="pts-preview__tile" />
        </div>
        <div className="pts-preview__side" />
      </div>
    );
  }
  return (
    <div className="pts-preview pts-preview--4" aria-hidden="true">
      <div className="pts-preview__flow">
        <span className="pts-preview__pill pts-preview__pill--wide" />
        <span className="pts-preview__pill" />
        <span className="pts-preview__pill pts-preview__pill--wide" />
        <span className="pts-preview__pill" />
        <span className="pts-preview__pill" />
      </div>
      <div className="pts-preview__side" />
    </div>
  );
};

const ProposalThemeSettingModal = () => {
  const { getCrudButtonTextName } = useContext(AuthContextProvider) || {};
  const common = useSelector((state) => state.Storage);
  const [savedThemeID, setSavedThemeID] = useState(null);
  const [selectedThemeID, setSelectedThemeID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", text }

  const fetchCurrentTheme = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await GetProposalDesignTheme();
      const fetchedID = res?.data?.responseData?.serviceThemeID;
      const current =
        THEME_OPTIONS.some((option) => option.id === fetchedID)
          ? fetchedID
          : 1;
      setSavedThemeID(current);
      setSelectedThemeID(current);
    } catch (error) {
      // Falls back to Theme 1 if the setting can't be read yet (e.g. the
      // backend endpoint above doesn't exist yet).
      setSavedThemeID(1);
      setSelectedThemeID(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof $ === "undefined") return undefined;
    const node = $("#ProposalThemeSettingModal");
    node.on("show.bs.modal", fetchCurrentTheme);
    return () => node.off("show.bs.modal", fetchCurrentTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!selectedThemeID || selectedThemeID === savedThemeID) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await UpdateProposalDesignTheme(common.userKeyID, {
        serviceThemeID: selectedThemeID,
      });
      if (res?.data?.statusCode === 200) {
        localStorage.setItem(
          "proposalDesignThemeID",
          String(selectedThemeID),
        );
        setSavedThemeID(selectedThemeID);
        setFeedback({
          type: "success",
          text: "Saved. Every organisation's Add/Update Proposal and Engagement Letter screens will use this design from their next visit.",
        });
      } else {
        setFeedback({
          type: "error",
          text:
            res?.data?.message ||
            "Couldn't save this right now. Please try again.",
        });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: "Couldn't save this right now. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = selectedThemeID !== savedThemeID;

  return (
    <div
      className="modal fade zoomIn pts-modal"
      id="ProposalThemeSettingModal"
      tabIndex="-1"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content pts-modal__content">
          <div className="modal-header pts-modal__header">
            <div className="pts-modal__heading">
              <h5 className="modal-title">Proposal Theme</h5>
              <p>
                Choose the Select Services design used on Add/Update Proposal
                and Add/Update Engagement Letter, for every organisation.
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body pts-modal__body">
            {isLoading ? (
              <p className="pts-status">Loading current setting…</p>
            ) : (
              <div className="pts-options">
                {THEME_OPTIONS.map((option) => {
                  const isSelected = selectedThemeID === option.id;
                  const isLive = savedThemeID === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`pts-option${isSelected ? " is-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="proposalDesignTheme"
                        value={option.id}
                        checked={isSelected}
                        onChange={() => setSelectedThemeID(option.id)}
                      />
                      <ThemePreview themeId={option.id} />
                      <span className="pts-option__name">
                        {option.name}
                        {isLive && (
                          <span className="pts-option__live">
                            <CheckCircleIcon fontSize="inherit" /> Live now
                          </span>
                        )}
                      </span>
                      <span className="pts-option__desc">
                        {option.description}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {feedback && (
              <p className={`pts-feedback pts-feedback--${feedback.type}`}>
                {feedback.text}
              </p>
            )}
          </div>

          <div className="modal-footer pts-modal__footer">
            <button
              type="button"
              className="btn btn-light pts-btn"
              data-bs-dismiss="modal"
            >
              {getCrudButtonTextName ? getCrudButtonTextName("Cancel") : "Cancel"}
            </button>
            <button
              type="button"
              className="btn btn-primary pts-btn pts-btn--primary"
              disabled={!hasChanges || isSaving || isLoading}
              onClick={handleSave}
            >
              {isSaving ? "Saving…" : "Save Theme"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalThemeSettingModal;
