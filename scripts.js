// Add event listener to all select elements
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
        const scores = calculateScore(); // Call the calculateScore function to get the scores object
        updateScoreDisplay(scores); // Call the updateScoreDisplay function to update the values in the HTML
    });
});

document.getElementById('export-data').addEventListener('click', exportData);

function calculateScore() {
    let scores = {
        gv: { totalScore: 0, controlCount: 0, subgroups: { oc: {}, rm: {}, rr: {}, po: {}, ov: {}, sc: {} } },
        id: { totalScore: 0, controlCount: 0, subgroups: { am: {}, ra: {}, im: {} } },
        pr: { totalScore: 0, controlCount: 0, subgroups: { aa: {}, at: {}, ds: {}, ps: {}, ir: {} } },
        de: { totalScore: 0, controlCount: 0, subgroups: { cm: {}, ae: {} } },
        rs: { totalScore: 0, controlCount: 0, subgroups: { ma: {}, an: {}, co: {}, mi: {} } },
        rc: { totalScore: 0, controlCount: 0, subgroups: { rp: {}, co: {} } },
        overallPercentage: 0
    };

    const subgroupKeys = {
        'gv-oc': 'oc', 'gv-rm': 'rm', 'gv-rr': 'rr', 'gv-po': 'po', 'gv-ov': 'ov', 'gv-sc': 'sc',
        'id-am': 'am', 'id-ra': 'ra', 'id-im': 'im',
        'pr-aa': 'aa', 'pr-at': 'at', 'pr-ds': 'ds', 'pr-ps': 'ps', 'pr-ir': 'ir',
        'de-cm': 'cm', 'de-ae': 'ae',
        'rs-ma': 'ma', 'rs-an': 'an', 'rs-co': 'co', 'rs-mi': 'mi',
        'rc-rp': 'rp', 'rc-co': 'co'
    };

    // Initialize subgroups
    for (let key in subgroupKeys) {
        let category = key.split('-')[0];
        let subgroup = subgroupKeys[key];
        scores[category].subgroups[subgroup] = { totalScore: 0, controlCount: 0, percentage: 0 };
    }

    // Iterate through each control group
    document.querySelectorAll('.control-group').forEach(group => {
        const currentSelect = group.querySelector('.current');
        const targetSelect = group.querySelector('.target');
        const current = parseInt(currentSelect.value);
        const target = parseInt(targetSelect.value);

        let score = 0;
        if (target === 0) {
            score = 0;  // If target is None, exclude this control from the score calculation
        } else if (current > target) {
            alert(`Current score cannot exceed the target score for ${group.querySelector('label').textContent.trim()}`);
            score = 0;
        } else {
            // Calculate the score for this control
            score = (current / target) * 100;
        }

        group.querySelector('.score').textContent = `${score.toFixed(2)}%`;

        // Aggregate scores based on subgroups and main categories
        for (let key in subgroupKeys) {
            if (currentSelect.id.startsWith(key)) {
                let category = key.split('-')[0];
                let subgroup = subgroupKeys[key];
                if (target !== 0) {
                    scores[category].subgroups[subgroup].totalScore += score;
                    scores[category].subgroups[subgroup].controlCount++;
                    scores[category].totalScore += score;
                    scores[category].controlCount++;
                }
                break;
            }
        }
    });

    // Calculate and add subgroup percentages
    for (let category in scores) {
        if (category === "overallPercentage") continue;
        for (let subgroup in scores[category].subgroups) {
            let subgroupData = scores[category].subgroups[subgroup];
            subgroupData.percentage = subgroupData.totalScore / subgroupData.controlCount || 0;
        }
        scores[category].percentage = scores[category].totalScore / scores[category].controlCount || 0;
    }

    scores.overallPercentage = (scores.gv.totalScore + scores.id.totalScore + scores.pr.totalScore + scores.de.totalScore + scores.rs.totalScore + scores.rc.totalScore) /
        (scores.gv.controlCount + scores.id.controlCount + scores.pr.controlCount + scores.de.controlCount + scores.rs.controlCount + scores.rc.controlCount) || 0;

    return scores;
}

function updateScoreDisplay(scores) {
    const subgroups = {
        'gv-oc-score': scores.gv.subgroups.oc.percentage,
        'gv-rm-score': scores.gv.subgroups.rm.percentage,
        'gv-rr-score': scores.gv.subgroups.rr.percentage,
        'gv-po-score': scores.gv.subgroups.po.percentage,
        'gv-ov-score': scores.gv.subgroups.ov.percentage,
        'gv-sc-score': scores.gv.subgroups.sc.percentage,

        'id-am-score': scores.id.subgroups.am.percentage,
        'id-ra-score': scores.id.subgroups.ra.percentage,
        'id-im-score': scores.id.subgroups.im.percentage,

        'pr-aa-score': scores.pr.subgroups.aa.percentage,
        'pr-at-score': scores.pr.subgroups.at.percentage,
        'pr-ds-score': scores.pr.subgroups.ds.percentage,
        'pr-ps-score': scores.pr.subgroups.ps.percentage,
        'pr-ir-score': scores.pr.subgroups.ir.percentage,

        'de-cm-score': scores.de.subgroups.cm.percentage,
        'de-ae-score': scores.de.subgroups.ae.percentage,

        'rs-ma-score': scores.rs.subgroups.ma.percentage,
        'rs-an-score': scores.rs.subgroups.an.percentage,
        'rs-co-score': scores.rs.subgroups.co.percentage,
        'rs-mi-score': scores.rs.subgroups.mi.percentage,

        'rc-rp-score': scores.rc.subgroups.rp.percentage,
        'rc-co-score': scores.rc.subgroups.co.percentage
    };

    const categories = {
        'governance-score': scores.gv.percentage,
        'identify-score': scores.id.percentage,
        'protect-score': scores.pr.percentage,
        'detect-score': scores.de.percentage,
        'respond-score': scores.rs.percentage,
        'recover-score': scores.rc.percentage
    };

    for (let id in subgroups) {
        document.getElementById(id).textContent = `${subgroups[id].toFixed(2)}%`;
    }

    for (let id in categories) {
        document.getElementById(id).textContent = `${id.split('-')[0].charAt(0).toUpperCase() + id.split('-')[0].slice(1)} Score: ${categories[id].toFixed(2)}%`;
    }

    document.getElementById('overall-score').textContent = `Overall Score: ${scores.overallPercentage.toFixed(2)}%`;
}


document.getElementById('export-data').addEventListener('click', exportData);

function exportData() {
    const data = gatherData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comsight-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function gatherData() {
    const data = {
        version: "0.1.0",
        date: new Date().toLocaleDateString(),
        gv: {
            gvOc: {
                gvOc01: {
                    current: document.getElementById('gv-oc-01-current').value,
                    target: document.getElementById('gv-oc-01-target').value
                },
                gvOc02: {
                    current: document.getElementById('gv-oc-02-current').value,
                    target: document.getElementById('gv-oc-02-target').value
                },
                gvOc03: {
                    current: document.getElementById('gv-oc-03-current').value,
                    target: document.getElementById('gv-oc-03-target').value
                },
                gvOc04: {
                    current: document.getElementById('gv-oc-04-current').value,
                    target: document.getElementById('gv-oc-04-target').value
                },
                gvOc05: {
                    current: document.getElementById('gv-oc-05-current').value,
                    target: document.getElementById('gv-oc-05-target').value
                }
            },
            gvRm: {
                gvRm01: {
                    current: document.getElementById('gv-rm-01-current').value,
                    target: document.getElementById('gv-rm-01-target').value
                },
                gvRm02: {
                    current: document.getElementById('gv-rm-02-current').value,
                    target: document.getElementById('gv-rm-02-target').value
                },
                gvRm03: {
                    current: document.getElementById('gv-rm-03-current').value,
                    target: document.getElementById('gv-rm-03-target').value
                },
                gvRm04: {
                    current: document.getElementById('gv-rm-04-current').value,
                    target: document.getElementById('gv-rm-04-target').value
                },
                gvRm05: {
                    current: document.getElementById('gv-rm-05-current').value,
                    target: document.getElementById('gv-rm-05-target').value
                },
                gvRm06: {
                    current: document.getElementById('gv-rm-06-current').value,
                    target: document.getElementById('gv-rm-06-target').value
                },
                gvRm07: {
                    current: document.getElementById('gv-rm-07-current').value,
                    target: document.getElementById('gv-rm-07-target').value
                }
            },
            gvRr: {
                gvRr01: {
                    current: document.getElementById('gv-rr-01-current').value,
                    target: document.getElementById('gv-rr-01-target').value
                },
                gvRr02: {
                    current: document.getElementById('gv-rr-02-current').value,
                    target: document.getElementById('gv-rr-02-target').value
                },
                gvRr03: {
                    current: document.getElementById('gv-rr-03-current').value,
                    target: document.getElementById('gv-rr-03-target').value
                },
                gvRr04: {
                    current: document.getElementById('gv-rr-04-current').value,
                    target: document.getElementById('gv-rr-04-target').value
                }
            },
            gvPo: {
                gvPo01: {
                    current: document.getElementById('gv-po-01-current').value,
                    target: document.getElementById('gv-po-01-target').value
                },
                gvPo02: {
                    current: document.getElementById('gv-po-02-current').value,
                    target: document.getElementById('gv-po-02-target').value
                }
            },
            gvOv: {
                gvOv01: {
                    current: document.getElementById('gv-ov-01-current').value,
                    target: document.getElementById('gv-ov-01-target').value
                },
                gvOv02: {
                    current: document.getElementById('gv-ov-02-current').value,
                    target: document.getElementById('gv-ov-02-target').value
                },
                gvOv03: {
                    current: document.getElementById('gv-ov-03-current').value,
                    target: document.getElementById('gv-ov-03-target').value
                }
            },
            gvSc: {
                gvSc01: {
                    current: document.getElementById('gv-sc-01-current').value,
                    target: document.getElementById('gv-sc-01-target').value
                },
                gvSc02: {
                    current: document.getElementById('gv-sc-02-current').value,
                    target: document.getElementById('gv-sc-02-target').value
                },
                gvSc03: {
                    current: document.getElementById('gv-sc-03-current').value,
                    target: document.getElementById('gv-sc-03-target').value
                },
                gvSc04: {
                    current: document.getElementById('gv-sc-04-current').value,
                    target: document.getElementById('gv-sc-04-target').value
                },
                gvSc05: {
                    current: document.getElementById('gv-sc-05-current').value,
                    target: document.getElementById('gv-sc-05-target').value
                },
                gvSc06: {
                    current: document.getElementById('gv-sc-06-current').value,
                    target: document.getElementById('gv-sc-06-target').value
                },
                gvSc07: {
                    current: document.getElementById('gv-sc-07-current').value,
                    target: document.getElementById('gv-sc-07-target').value
                },
                gvSc08: {
                    current: document.getElementById('gv-sc-08-current').value,
                    target: document.getElementById('gv-sc-08-target').value
                },
                gvSc09: {
                    current: document.getElementById('gv-sc-09-current').value,
                    target: document.getElementById('gv-sc-09-target').value
                },
                gvSc10: {
                    current: document.getElementById('gv-sc-10-current').value,
                    target: document.getElementById('gv-sc-10-target').value
                }
            }
        },
        id: {
            idAm: {
                idAm01: {
                    current: document.getElementById('id-am-01-current').value,
                    target: document.getElementById('id-am-01-target').value
                },
                idAm02: {
                    current: document.getElementById('id-am-02-current').value,
                    target: document.getElementById('id-am-02-target').value
                },
                idAm03: {
                    current: document.getElementById('id-am-03-current').value,
                    target: document.getElementById('id-am-03-target').value
                },
                idAm04: {
                    current: document.getElementById('id-am-04-current').value,
                    target: document.getElementById('id-am-04-target').value
                },
                idAm05: {
                    current: document.getElementById('id-am-05-current').value,
                    target: document.getElementById('id-am-05-target').value
                },
                idAm07: {
                    current: document.getElementById('id-am-07-current').value,
                    target: document.getElementById('id-am-07-target').value
                },
                idAm08: {
                    current: document.getElementById('id-am-08-current').value,
                    target: document.getElementById('id-am-08-target').value
                }
            },
            idRa: {
                idRa01: {
                    current: document.getElementById('id-ra-01-current').value,
                    target: document.getElementById('id-ra-01-target').value
                },
                idRa02: {
                    current: document.getElementById('id-ra-02-current').value,
                    target: document.getElementById('id-ra-02-target').value
                },
                idRa03: {
                    current: document.getElementById('id-ra-03-current').value,
                    target: document.getElementById('id-ra-03-target').value
                },
                idRa04: {
                    current: document.getElementById('id-ra-04-current').value,
                    target: document.getElementById('id-ra-04-target').value
                },
                idRa05: {
                    current: document.getElementById('id-ra-05-current').value,
                    target: document.getElementById('id-ra-05-target').value
                },
                idRa06: {
                    current: document.getElementById('id-ra-06-current').value,
                    target: document.getElementById('id-ra-06-target').value
                },
                idRa07: {
                    current: document.getElementById('id-ra-07-current').value,
                    target: document.getElementById('id-ra-07-target').value
                },
                idRa08: {
                    current: document.getElementById('id-ra-08-current').value,
                    target: document.getElementById('id-ra-08-target').value
                },
                idRa09: {
                    current: document.getElementById('id-ra-09-current').value,
                    target: document.getElementById('id-ra-09-target').value
                },
                idRa10: {
                    current: document.getElementById('id-ra-10-current').value,
                    target: document.getElementById('id-ra-10-target').value
                }
            },
            idIm: {
                idIm01: {
                    current: document.getElementById('id-im-01-current').value,
                    target: document.getElementById('id-im-01-target').value
                },
                idIm02: {
                    current: document.getElementById('id-im-02-current').value,
                    target: document.getElementById('id-im-02-target').value
                },
                idIm03: {
                    current: document.getElementById('id-im-03-current').value,
                    target: document.getElementById('id-im-03-target').value
                },
                idIm04: {
                    current: document.getElementById('id-im-04-current').value,
                    target: document.getElementById('id-im-04-target').value
                }
            }
        },
        pr: {
            prAa: {
                prAa01: {
                    current: document.getElementById('pr-aa-01-current').value,
                    target: document.getElementById('pr-aa-01-target').value
                },
                prAa02: {
                    current: document.getElementById('pr-aa-02-current').value,
                    target: document.getElementById('pr-aa-02-target').value
                },
                prAa03: {
                    current: document.getElementById('pr-aa-03-current').value,
                    target: document.getElementById('pr-aa-03-target').value
                },
                prAa04: {
                    current: document.getElementById('pr-aa-04-current').value,
                    target: document.getElementById('pr-aa-04-target').value
                },
                prAa05: {
                    current: document.getElementById('pr-aa-05-current').value,
                    target: document.getElementById('pr-aa-05-target').value
                },
                prAa06: {
                    current: document.getElementById('pr-aa-06-current').value,
                    target: document.getElementById('pr-aa-06-target').value
                }
            },
            prAt: {
                prAt01: {
                    current: document.getElementById('pr-at-01-current').value,
                    target: document.getElementById('pr-at-01-target').value
                },
                prAt02: {
                    current: document.getElementById('pr-at-02-current').value,
                    target: document.getElementById('pr-at-02-target').value
                }
            },
            prDs: {
                prDs01: {
                    current: document.getElementById('pr-ds-01-current').value,
                    target: document.getElementById('pr-ds-01-target').value
                },
                prDs02: {
                    current: document.getElementById('pr-ds-02-current').value,
                    target: document.getElementById('pr-ds-02-target').value
                },
                prDs10: {
                    current: document.getElementById('pr-ds-10-current').value,
                    target: document.getElementById('pr-ds-10-target').value
                },
                prDs11: {
                    current: document.getElementById('pr-ds-11-current').value,
                    target: document.getElementById('pr-ds-11-target').value
                }
            },
            prPs: {
                prPs01: {
                    current: document.getElementById('pr-ps-01-current').value,
                    target: document.getElementById('pr-ps-01-target').value
                },
                prPs02: {
                    current: document.getElementById('pr-ps-02-current').value,
                    target: document.getElementById('pr-ps-02-target').value
                },
                prPs03: {
                    current: document.getElementById('pr-ps-03-current').value,
                    target: document.getElementById('pr-ps-03-target').value
                },
                prPs04: {
                    current: document.getElementById('pr-ps-04-current').value,
                    target: document.getElementById('pr-ps-04-target').value
                },
                prPs05: {
                    current: document.getElementById('pr-ps-05-current').value,
                    target: document.getElementById('pr-ps-05-target').value
                },
                prPs06: {
                    current: document.getElementById('pr-ps-06-current').value,
                    target: document.getElementById('pr-ps-06-target').value
                }
            },
            prIr: {
                prIr01: {
                    current: document.getElementById('pr-ir-01-current').value,
                    target: document.getElementById('pr-ir-01-target').value
                },
                prIr02: {
                    current: document.getElementById('pr-ir-02-current').value,
                    target: document.getElementById('pr-ir-02-target').value
                },
                prIr03: {
                    current: document.getElementById('pr-ir-03-current').value,
                    target: document.getElementById('pr-ir-03-target').value
                },
                prIr04: {
                    current: document.getElementById('pr-ir-04-current').value,
                    target: document.getElementById('pr-ir-04-target').value
                }
            }
        },
        de: {
            deCm: {
                deCm01: {
                    current: document.getElementById('de-cm-01-current').value,
                    target: document.getElementById('de-cm-01-target').value
                },
                deCm02: {
                    current: document.getElementById('de-cm-02-current').value,
                    target: document.getElementById('de-cm-02-target').value
                },
                deCm03: {
                    current: document.getElementById('de-cm-03-current').value,
                    target: document.getElementById('de-cm-03-target').value
                },
                deCm06: {
                    current: document.getElementById('de-cm-06-current').value,
                    target: document.getElementById('de-cm-06-target').value
                },
                deCm09: {
                    current: document.getElementById('de-cm-09-current').value,
                    target: document.getElementById('de-cm-09-target').value
                }
            },
            deAe: {
                deAe02: {
                    current: document.getElementById('de-ae-02-current').value,
                    target: document.getElementById('de-ae-02-target').value
                },
                deAe03: {
                    current: document.getElementById('de-ae-03-current').value,
                    target: document.getElementById('de-ae-03-target').value
                },
                deAe04: {
                    current: document.getElementById('de-ae-04-current').value,
                    target: document.getElementById('de-ae-04-target').value
                },
                deAe06: {
                    current: document.getElementById('de-ae-06-current').value,
                    target: document.getElementById('de-ae-06-target').value
                },
                deAe07: {
                    current: document.getElementById('de-ae-07-current').value,
                    target: document.getElementById('de-ae-07-target').value
                },
                deAe08: {
                    current: document.getElementById('de-ae-08-current').value,
                    target: document.getElementById('de-ae-08-target').value
                }
            }
        },
        rs: {
            rsMa: {
                rsMa01: {
                    current: document.getElementById('rs-ma-01-current').value,
                    target: document.getElementById('rs-ma-01-target').value
                },
                rsMa02: {
                    current: document.getElementById('rs-ma-02-current').value,
                    target: document.getElementById('rs-ma-02-target').value
                },
                rsMa03: {
                    current: document.getElementById('rs-ma-03-current').value,
                    target: document.getElementById('rs-ma-03-target').value
                },
                rsMa04: {
                    current: document.getElementById('rs-ma-04-current').value,
                    target: document.getElementById('rs-ma-04-target').value
                },
                rsMa05: {
                    current: document.getElementById('rs-ma-05-current').value,
                    target: document.getElementById('rs-ma-05-target').value
                }
            },
            rsAn: {
                rsAn03: {
                    current: document.getElementById('rs-an-03-current').value,
                    target: document.getElementById('rs-an-03-target').value
                },
                rsAn06: {
                    current: document.getElementById('rs-an-06-current').value,
                    target: document.getElementById('rs-an-06-target').value
                },
                rsAn07: {
                    current: document.getElementById('rs-an-07-current').value,
                    target: document.getElementById('rs-an-07-target').value
                },
                rsAn08: {
                    current: document.getElementById('rs-an-08-current').value,
                    target: document.getElementById('rs-an-08-target').value
                }
            },
            rsCo: {
                rsCo02: {
                    current: document.getElementById('rs-co-02-current').value,
                    target: document.getElementById('rs-co-02-target').value
                },
                rsCo03: {
                    current: document.getElementById('rs-co-03-current').value,
                    target: document.getElementById('rs-co-03-target').value
                }
            },
            rsMi: {
                rsMi01: {
                    current: document.getElementById('rs-mi-01-current').value,
                    target: document.getElementById('rs-mi-01-target').value
                },
                rsMi02: {
                    current: document.getElementById('rs-mi-02-current').value,
                    target: document.getElementById('rs-mi-02-target').value
                }
            }
        },
        rc: {
            rcRp: {
                rcRp01: {
                    current: document.getElementById('rc-rp-01-current').value,
                    target: document.getElementById('rc-rp-01-target').value
                },
                rcRp02: {
                    current: document.getElementById('rc-rp-02-current').value,
                    target: document.getElementById('rc-rp-02-target').value
                },
                rcRp03: {
                    current: document.getElementById('rc-rp-03-current').value,
                    target: document.getElementById('rc-rp-03-target').value
                },
                rcRp04: {
                    current: document.getElementById('rc-rp-04-current').value,
                    target: document.getElementById('rc-rp-04-target').value
                },
                rcRp05: {
                    current: document.getElementById('rc-rp-05-current').value,
                    target: document.getElementById('rc-rp-05-target').value
                },
                rcRp06: {
                    current: document.getElementById('rc-rp-06-current').value,
                    target: document.getElementById('rc-rp-06-target').value
                }
            },
            rcCo: {
                rcCo03: {
                    current: document.getElementById('rc-co-03-current').value,
                    target: document.getElementById('rc-co-03-target').value
                },
                rcCo04: {
                    current: document.getElementById('rc-co-04-current').value,
                    target: document.getElementById('rc-co-04-target').value
                }
            }
        }
    };

    return data;
}

document.getElementById('import-data').addEventListener('click', () => document.getElementById('file-input').click());
document.getElementById('file-input').addEventListener('change', importData);

function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        populateData(data);
    };
    reader.readAsText(file);
}

function populateData(data) {
    // Governance
    document.getElementById('gv-oc-01-current').value = data.gv.gvOc.gvOc01.current;
    document.getElementById('gv-oc-01-target').value = data.gv.gvOc.gvOc01.target;
    document.getElementById('gv-oc-02-current').value = data.gv.gvOc.gvOc02.current;
    document.getElementById('gv-oc-02-target').value = data.gv.gvOc.gvOc02.target;
    document.getElementById('gv-oc-03-current').value = data.gv.gvOc.gvOc03.current;
    document.getElementById('gv-oc-03-target').value = data.gv.gvOc.gvOc03.target;
    document.getElementById('gv-oc-04-current').value = data.gv.gvOc.gvOc04.current;
    document.getElementById('gv-oc-04-target').value = data.gv.gvOc.gvOc04.target;
    document.getElementById('gv-oc-05-current').value = data.gv.gvOc.gvOc05.current;
    document.getElementById('gv-oc-05-target').value = data.gv.gvOc.gvOc05.target;

    document.getElementById('gv-rm-01-current').value = data.gv.gvRm.gvRm01.current;
    document.getElementById('gv-rm-01-target').value = data.gv.gvRm.gvRm01.target;
    document.getElementById('gv-rm-02-current').value = data.gv.gvRm.gvRm02.current;
    document.getElementById('gv-rm-02-target').value = data.gv.gvRm.gvRm02.target;
    document.getElementById('gv-rm-03-current').value = data.gv.gvRm.gvRm03.current;
    document.getElementById('gv-rm-03-target').value = data.gv.gvRm.gvRm03.target;
    document.getElementById('gv-rm-04-current').value = data.gv.gvRm.gvRm04.current;
    document.getElementById('gv-rm-04-target').value = data.gv.gvRm.gvRm04.target;
    document.getElementById('gv-rm-05-current').value = data.gv.gvRm.gvRm05.current;
    document.getElementById('gv-rm-05-target').value = data.gv.gvRm.gvRm05.target;
    document.getElementById('gv-rm-06-current').value = data.gv.gvRm.gvRm06.current;
    document.getElementById('gv-rm-06-target').value = data.gv.gvRm.gvRm06.target;
    document.getElementById('gv-rm-07-current').value = data.gv.gvRm.gvRm07.current;
    document.getElementById('gv-rm-07-target').value = data.gv.gvRm.gvRm07.target;

    document.getElementById('gv-rr-01-current').value = data.gv.gvRr.gvRr01.current;
    document.getElementById('gv-rr-01-target').value = data.gv.gvRr.gvRr01.target;
    document.getElementById('gv-rr-02-current').value = data.gv.gvRr.gvRr02.current;
    document.getElementById('gv-rr-02-target').value = data.gv.gvRr.gvRr02.target;
    document.getElementById('gv-rr-03-current').value = data.gv.gvRr.gvRr03.current;
    document.getElementById('gv-rr-03-target').value = data.gv.gvRr.gvRr03.target;
    document.getElementById('gv-rr-04-current').value = data.gv.gvRr.gvRr04.current;
    document.getElementById('gv-rr-04-target').value = data.gv.gvRr.gvRr04.target;

    document.getElementById('gv-po-01-current').value = data.gv.gvPo.gvPo01.current;
    document.getElementById('gv-po-01-target').value = data.gv.gvPo.gvPo01.target;
    document.getElementById('gv-po-02-current').value = data.gv.gvPo.gvPo02.current;
    document.getElementById('gv-po-02-target').value = data.gv.gvPo.gvPo02.target;

    document.getElementById('gv-ov-01-current').value = data.gv.gvOv.gvOv01.current;
    document.getElementById('gv-ov-01-target').value = data.gv.gvOv.gvOv01.target;
    document.getElementById('gv-ov-02-current').value = data.gv.gvOv.gvOv02.current;
    document.getElementById('gv-ov-02-target').value = data.gv.gvOv.gvOv02.target;
    document.getElementById('gv-ov-03-current').value = data.gv.gvOv.gvOv03.current;
    document.getElementById('gv-ov-03-target').value = data.gv.gvOv.gvOv03.target;

    document.getElementById('gv-sc-01-current').value = data.gv.gvSc.gvSc01.current;
    document.getElementById('gv-sc-01-target').value = data.gv.gvSc.gvSc01.target;
    document.getElementById('gv-sc-02-current').value = data.gv.gvSc.gvSc02.current;
    document.getElementById('gv-sc-02-target').value = data.gv.gvSc.gvSc02.target;
    document.getElementById('gv-sc-03-current').value = data.gv.gvSc.gvSc03.current;
    document.getElementById('gv-sc-03-target').value = data.gv.gvSc.gvSc03.target;
    document.getElementById('gv-sc-04-current').value = data.gv.gvSc.gvSc04.current;
    document.getElementById('gv-sc-04-target').value = data.gv.gvSc.gvSc04.target;
    document.getElementById('gv-sc-05-current').value = data.gv.gvSc.gvSc05.current;
    document.getElementById('gv-sc-05-target').value = data.gv.gvSc.gvSc05.target;
    document.getElementById('gv-sc-06-current').value = data.gv.gvSc.gvSc06.current;
    document.getElementById('gv-sc-06-target').value = data.gv.gvSc.gvSc06.target;
    document.getElementById('gv-sc-07-current').value = data.gv.gvSc.gvSc07.current;
    document.getElementById('gv-sc-07-target').value = data.gv.gvSc.gvSc07.target;
    document.getElementById('gv-sc-08-current').value = data.gv.gvSc.gvSc08.current;
    document.getElementById('gv-sc-08-target').value = data.gv.gvSc.gvSc08.target;
    document.getElementById('gv-sc-09-current').value = data.gv.gvSc.gvSc09.current;
    document.getElementById('gv-sc-09-target').value = data.gv.gvSc.gvSc09.target;
    document.getElementById('gv-sc-10-current').value = data.gv.gvSc.gvSc10.current;
    document.getElementById('gv-sc-10-target').value = data.gv.gvSc.gvSc10.target;

    // Identify
    document.getElementById('id-am-01-current').value = data.id.idAm.idAm01.current;
    document.getElementById('id-am-01-target').value = data.id.idAm.idAm01.target;
    document.getElementById('id-am-02-current').value = data.id.idAm.idAm02.current;
    document.getElementById('id-am-02-target').value = data.id.idAm.idAm02.target;
    document.getElementById('id-am-03-current').value = data.id.idAm.idAm03.current;
    document.getElementById('id-am-03-target').value = data.id.idAm.idAm03.target;
    document.getElementById('id-am-04-current').value = data.id.idAm.idAm04.current;
    document.getElementById('id-am-04-target').value = data.id.idAm.idAm04.target;
    document.getElementById('id-am-05-current').value = data.id.idAm.idAm05.current;
    document.getElementById('id-am-05-target').value = data.id.idAm.idAm05.target;
    document.getElementById('id-am-07-current').value = data.id.idAm.idAm07.current;
    document.getElementById('id-am-07-target').value = data.id.idAm.idAm07.target;
    document.getElementById('id-am-08-current').value = data.id.idAm.idAm08.current;
    document.getElementById('id-am-08-target').value = data.id.idAm.idAm08.target;

    document.getElementById('id-ra-01-current').value = data.id.idRa.idRa01.current;
    document.getElementById('id-ra-01-target').value = data.id.idRa.idRa01.target;
    document.getElementById('id-ra-02-current').value = data.id.idRa.idRa02.current;
    document.getElementById('id-ra-02-target').value = data.id.idRa.idRa02.target;
    document.getElementById('id-ra-03-current').value = data.id.idRa.idRa03.current;
    document.getElementById('id-ra-03-target').value = data.id.idRa.idRa03.target;
    document.getElementById('id-ra-04-current').value = data.id.idRa.idRa04.current;
    document.getElementById('id-ra-04-target').value = data.id.idRa.idRa04.target;
    document.getElementById('id-ra-05-current').value = data.id.idRa.idRa05.current;
    document.getElementById('id-ra-05-target').value = data.id.idRa.idRa05.target;
    document.getElementById('id-ra-06-current').value = data.id.idRa.idRa06.current;
    document.getElementById('id-ra-06-target').value = data.id.idRa.idRa06.target;
    document.getElementById('id-ra-07-current').value = data.id.idRa.idRa07.current;
    document.getElementById('id-ra-07-target').value = data.id.idRa.idRa07.target;
    document.getElementById('id-ra-08-current').value = data.id.idRa.idRa08.current;
    document.getElementById('id-ra-08-target').value = data.id.idRa.idRa08.target;
    document.getElementById('id-ra-09-current').value = data.id.idRa.idRa09.current;
    document.getElementById('id-ra-09-target').value = data.id.idRa.idRa09.target;
    document.getElementById('id-ra-10-current').value = data.id.idRa.idRa10.current;
    document.getElementById('id-ra-10-target').value = data.id.idRa.idRa10.target;

    document.getElementById('id-im-01-current').value = data.id.idIm.idIm01.current;
    document.getElementById('id-im-01-target').value = data.id.idIm.idIm01.target;
    document.getElementById('id-im-02-current').value = data.id.idIm.idIm02.current;
    document.getElementById('id-im-02-target').value = data.id.idIm.idIm02.target;
    document.getElementById('id-im-03-current').value = data.id.idIm.idIm03.current;
    document.getElementById('id-im-03-target').value = data.id.idIm.idIm03.target;
    document.getElementById('id-im-04-current').value = data.id.idIm.idIm04.current;
    document.getElementById('id-im-04-target').value = data.id.idIm.idIm04.target;

    // Protect
    document.getElementById('pr-aa-01-current').value = data.pr.prAa.prAa01.current;
    document.getElementById('pr-aa-01-target').value = data.pr.prAa.prAa01.target;
    document.getElementById('pr-aa-02-current').value = data.pr.prAa.prAa02.current;
    document.getElementById('pr-aa-02-target').value = data.pr.prAa.prAa02.target;
    document.getElementById('pr-aa-03-current').value = data.pr.prAa.prAa03.current;
    document.getElementById('pr-aa-03-target').value = data.pr.prAa.prAa03.target;
    document.getElementById('pr-aa-04-current').value = data.pr.prAa.prAa04.current;
    document.getElementById('pr-aa-04-target').value = data.pr.prAa.prAa04.target;
    document.getElementById('pr-aa-05-current').value = data.pr.prAa.prAa05.current;
    document.getElementById('pr-aa-05-target').value = data.pr.prAa.prAa05.target;
    document.getElementById('pr-aa-06-current').value = data.pr.prAa.prAa06.current;
    document.getElementById('pr-aa-06-target').value = data.pr.prAa.prAa06.target;

    document.getElementById('pr-at-01-current').value = data.pr.prAt.prAt01.current;
    document.getElementById('pr-at-01-target').value = data.pr.prAt.prAt01.target;
    document.getElementById('pr-at-02-current').value = data.pr.prAt.prAt02.current;
    document.getElementById('pr-at-02-target').value = data.pr.prAt.prAt02.target;

    document.getElementById('pr-ds-01-current').value = data.pr.prDs.prDs01.current;
    document.getElementById('pr-ds-01-target').value = data.pr.prDs.prDs01.target;
    document.getElementById('pr-ds-02-current').value = data.pr.prDs.prDs02.current;
    document.getElementById('pr-ds-02-target').value = data.pr.prDs.prDs02.target;
    document.getElementById('pr-ds-10-current').value = data.pr.prDs.prDs10.current;
    document.getElementById('pr-ds-10-target').value = data.pr.prDs.prDs10.target;
    document.getElementById('pr-ds-11-current').value = data.pr.prDs.prDs11.current;
    document.getElementById('pr-ds-11-target').value = data.pr.prDs.prDs11.target;

    document.getElementById('pr-ps-01-current').value = data.pr.prPs.prPs01.current;
    document.getElementById('pr-ps-01-target').value = data.pr.prPs.prPs01.target;
    document.getElementById('pr-ps-02-current').value = data.pr.prPs.prPs02.current;
    document.getElementById('pr-ps-02-target').value = data.pr.prPs.prPs02.target;
    document.getElementById('pr-ps-03-current').value = data.pr.prPs.prPs03.current;
    document.getElementById('pr-ps-03-target').value = data.pr.prPs.prPs03.target;
    document.getElementById('pr-ps-04-current').value = data.pr.prPs.prPs04.current;
    document.getElementById('pr-ps-04-target').value = data.pr.prPs.prPs04.target;
    document.getElementById('pr-ps-05-current').value = data.pr.prPs.prPs05.current;
    document.getElementById('pr-ps-05-target').value = data.pr.prPs.prPs05.target;
    document.getElementById('pr-ps-06-current').value = data.pr.prPs.prPs06.current;
    document.getElementById('pr-ps-06-target').value = data.pr.prPs.prPs06.target;

    document.getElementById('pr-ir-01-current').value = data.pr.prIr.prIr01.current;
    document.getElementById('pr-ir-01-target').value = data.pr.prIr.prIr01.target;
    document.getElementById('pr-ir-02-current').value = data.pr.prIr.prIr02.current;
    document.getElementById('pr-ir-02-target').value = data.pr.prIr.prIr02.target;
    document.getElementById('pr-ir-03-current').value = data.pr.prIr.prIr03.current;
    document.getElementById('pr-ir-03-target').value = data.pr.prIr.prIr03.target;
    document.getElementById('pr-ir-04-current').value = data.pr.prIr.prIr04.current;
    document.getElementById('pr-ir-04-target').value = data.pr.prIr.prIr04.target;

    // Detect
    document.getElementById('de-cm-01-current').value = data.de.deCm.deCm01.current;
    document.getElementById('de-cm-01-target').value = data.de.deCm.deCm01.target;
    document.getElementById('de-cm-02-current').value = data.de.deCm.deCm02.current;
    document.getElementById('de-cm-02-target').value = data.de.deCm.deCm02.target;
    document.getElementById('de-cm-03-current').value = data.de.deCm.deCm03.current;
    document.getElementById('de-cm-03-target').value = data.de.deCm.deCm03.target;
    document.getElementById('de-cm-06-current').value = data.de.deCm.deCm06.current;
    document.getElementById('de-cm-06-target').value = data.de.deCm.deCm06.target;
    document.getElementById('de-cm-09-current').value = data.de.deCm.deCm09.current;
    document.getElementById('de-cm-09-target').value = data.de.deCm.deCm09.target;

    document.getElementById('de-ae-02-current').value = data.de.deAe.deAe02.current;
    document.getElementById('de-ae-02-target').value = data.de.deAe.deAe02.target;
    document.getElementById('de-ae-03-current').value = data.de.deAe.deAe03.current;
    document.getElementById('de-ae-03-target').value = data.de.deAe.deAe03.target;
    document.getElementById('de-ae-04-current').value = data.de.deAe.deAe04.current;
    document.getElementById('de-ae-04-target').value = data.de.deAe.deAe04.target;
    document.getElementById('de-ae-06-current').value = data.de.deAe.deAe06.current;
    document.getElementById('de-ae-06-target').value = data.de.deAe.deAe06.target;
    document.getElementById('de-ae-07-current').value = data.de.deAe.deAe07.current;
    document.getElementById('de-ae-07-target').value = data.de.deAe.deAe07.target;
    document.getElementById('de-ae-08-current').value = data.de.deAe.deAe08.current;
    document.getElementById('de-ae-08-target').value = data.de.deAe.deAe08.target;

    // Respond  
    document.getElementById('rs-ma-01-current').value = data.rs.rsMa.rsMa01.current;
    document.getElementById('rs-ma-01-target').value = data.rs.rsMa.rsMa01.target;
    document.getElementById('rs-ma-02-current').value = data.rs.rsMa.rsMa02.current;
    document.getElementById('rs-ma-02-target').value = data.rs.rsMa.rsMa02.target;
    document.getElementById('rs-ma-03-current').value = data.rs.rsMa.rsMa03.current;
    document.getElementById('rs-ma-03-target').value = data.rs.rsMa.rsMa03.target;
    document.getElementById('rs-ma-04-current').value = data.rs.rsMa.rsMa04.current;
    document.getElementById('rs-ma-04-target').value = data.rs.rsMa.rsMa04.target;
    document.getElementById('rs-ma-05-current').value = data.rs.rsMa.rsMa05.current;
    document.getElementById('rs-ma-05-target').value = data.rs.rsMa.rsMa05.target;

    document.getElementById('rs-an-03-current').value = data.rs.rsAn.rsAn03.current;
    document.getElementById('rs-an-03-target').value = data.rs.rsAn.rsAn03.target;
    document.getElementById('rs-an-06-current').value = data.rs.rsAn.rsAn06.current;
    document.getElementById('rs-an-06-target').value = data.rs.rsAn.rsAn06.target;
    document.getElementById('rs-an-07-current').value = data.rs.rsAn.rsAn07.current;
    document.getElementById('rs-an-07-target').value = data.rs.rsAn.rsAn07.target;
    document.getElementById('rs-an-08-current').value = data.rs.rsAn.rsAn08.current;
    document.getElementById('rs-an-08-target').value = data.rs.rsAn.rsAn08.target;

    document.getElementById('rs-co-02-current').value = data.rs.rsCo.rsCo02.current;
    document.getElementById('rs-co-02-target').value = data.rs.rsCo.rsCo02.target;
    document.getElementById('rs-co-03-current').value = data.rs.rsCo.rsCo03.current;
    document.getElementById('rs-co-03-target').value = data.rs.rsCo.rsCo03.target;

    document.getElementById('rs-mi-01-current').value = data.rs.rsMi.rsMi01.current;
    document.getElementById('rs-mi-01-target').value = data.rs.rsMi.rsMi01.target;
    document.getElementById('rs-mi-02-current').value = data.rs.rsMi.rsMi02.current;
    document.getElementById('rs-mi-02-target').value = data.rs.rsMi.rsMi02.target;

    // Recover`
    document.getElementById('rc-rp-01-current').value = data.rc.rcRp.rcRp01.current;
    document.getElementById('rc-rp-01-target').value = data.rc.rcRp.rcRp01.target;
    document.getElementById('rc-rp-02-current').value = data.rc.rcRp.rcRp02.current;
    document.getElementById('rc-rp-02-target').value = data.rc.rcRp.rcRp02.target;
    document.getElementById('rc-rp-03-current').value = data.rc.rcRp.rcRp03.current;
    document.getElementById('rc-rp-03-target').value = data.rc.rcRp.rcRp03.target;
    document.getElementById('rc-rp-04-current').value = data.rc.rcRp.rcRp04.current;
    document.getElementById('rc-rp-04-target').value = data.rc.rcRp.rcRp04.target;
    document.getElementById('rc-rp-05-current').value = data.rc.rcRp.rcRp05.current;
    document.getElementById('rc-rp-05-target').value = data.rc.rcRp.rcRp05.target;
    document.getElementById('rc-rp-06-current').value = data.rc.rcRp.rcRp06.current;
    document.getElementById('rc-rp-06-target').value = data.rc.rcRp.rcRp06.target;

    document.getElementById('rc-co-03-current').value = data.rc.rcCo.rcCo03.current;
    document.getElementById('rc-co-03-target').value = data.rc.rcCo.rcCo03.target;
    document.getElementById('rc-co-04-current').value = data.rc.rcCo.rcCo04.current;
    document.getElementById('rc-co-04-target').value = data.rc.rcCo.rcCo04.target;
    const scores = calculateScore();
    updateScoreDisplay(scores);
}

document.addEventListener('dragenter', handleDragEnter);
document.addEventListener('dragover', handleDragOver);
document.addEventListener('dragleave', handleDragLeave);
document.addEventListener('drop', handleDrop);

function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('drop-area').style.display = 'block';
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.target === document.getElementById('drop-area')) {
        document.getElementById('drop-area').style.display = 'none';
    }
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('drop-area').style.display = 'none';

    const file = event.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = JSON.parse(e.target.result);
        populateData(data); // Assuming you have this function
        calculateScore();   // Recalculate the scores after populating the data
    };
    reader.readAsText(file);
}

document.getElementById('summarize-data').addEventListener('click', openSummaryPane);
document.querySelector('.summary-content .close').addEventListener('click', closeSummaryPane);

function openSummaryPane() {
    generateSummary();
    document.getElementById('summary-pane').style.display = 'block';
}

function closeSummaryPane() {
    document.getElementById('summary-pane').style.display = 'none';
}

function generateSummary() {
    const scores = calculateScore(); // Assuming calculateScore() is available and returns the required data structure

    // Generate the pie chart
    generatePieChart(scores);

    // Generate the summary table
    generateSummaryTable(scores);
}

function generatePieChart(data) {
    // Example chart generation logic (using Chart.js library)
    const ctx = document.createElement('canvas');
    document.getElementById('summary-chart').innerHTML = '';
    document.getElementById('summary-chart').appendChild(ctx);

    const chartData = [
        calculatePercentage(data.gv),
        calculatePercentage(data.id),
        calculatePercentage(data.pr),
        calculatePercentage(data.de),
        calculatePercentage(data.rs),
        calculatePercentage(data.rc)
    ];

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Governance', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
            datasets: [{
                data: chartData,
                backgroundColor: ['#2980b9', '#27ae60', '#f39c12', '#e74c3c', '#8e44ad', '#34495e']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                datalabels: {
                    formatter: (value) => {
                        return value + "%";
                    },
                    color: '#fff',
                    display: 'auto'
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


function generateSummaryTable(data) {
    const summaryTable = document.getElementById('summary-table');
    summaryTable.innerHTML = `
        <tr>
            <th>Group</th>
            <th>Percentage</th>
        </tr>
        ${generateTableRows(data)}
    `;
}

function generateTableRows(data) {
    const rows = [];

    rows.push(generateTableRow('overall', 'Overall', data.overallPercentage.toFixed(2)));

    rows.push(generateTableRow('gv', 'Organizational Context (GV.OC)', calculatePercentage(data.gv.subgroups.oc)));
    rows.push(generateTableRow('gv', 'Risk Management (GV.RM)', calculatePercentage(data.gv.subgroups.rm)));
    rows.push(generateTableRow('gv', 'Risk Response (GV.RR)', calculatePercentage(data.gv.subgroups.rr)));
    rows.push(generateTableRow('gv', 'Policy (GV.PO)', calculatePercentage(data.gv.subgroups.po)));
    rows.push(generateTableRow('gv', 'Oversight (GV.OV)', calculatePercentage(data.gv.subgroups.ov)));
    rows.push(generateTableRow('gv', 'Security Culture (GV.SC)', calculatePercentage(data.gv.subgroups.sc)));

    rows.push(generateTableRow('id', 'Asset Management (ID.AM)', calculatePercentage(data.id.subgroups.am)));
    rows.push(generateTableRow('id', 'Risk Assessment (ID.RA)', calculatePercentage(data.id.subgroups.ra)));
    rows.push(generateTableRow('id', 'Risk Management Strategy (ID.IM)', calculatePercentage(data.id.subgroups.im)));

    rows.push(generateTableRow('pr', 'Awareness and Training (PR.AA)', calculatePercentage(data.pr.subgroups.aa)));
    rows.push(generateTableRow('pr', 'Access Control (PR.AT)', calculatePercentage(data.pr.subgroups.at)));
    rows.push(generateTableRow('pr', 'Data Security (PR.DS)', calculatePercentage(data.pr.subgroups.ds)));
    rows.push(generateTableRow('pr', 'Information Protection (PR.PS)', calculatePercentage(data.pr.subgroups.ps)));
    rows.push(generateTableRow('pr', 'Incident Response (PR.IR)', calculatePercentage(data.pr.subgroups.ir)));

    rows.push(generateTableRow('de', 'Anomalies and Events (DE.CM)', calculatePercentage(data.de.subgroups.cm)));
    rows.push(generateTableRow('de', 'Security Continuous Monitoring (DE.AE)', calculatePercentage(data.de.subgroups.ae)));

    rows.push(generateTableRow('rs', 'Response Planning (RS.MA)', calculatePercentage(data.rs.subgroups.ma)));
    rows.push(generateTableRow('rs', 'Analysis (RS.AN)', calculatePercentage(data.rs.subgroups.an)));
    rows.push(generateTableRow('rs', 'Communications (RS.CO)', calculatePercentage(data.rs.subgroups.co)));
    rows.push(generateTableRow('rs', 'Mitigation (RS.MI)', calculatePercentage(data.rs.subgroups.mi)));

    rows.push(generateTableRow('rc', 'Recovery Planning (RC.RP)', calculatePercentage(data.rc.subgroups.rp)));
    rows.push(generateTableRow('rc', 'Communications (RC.CO)', calculatePercentage(data.rc.subgroups.co)));

    return rows.join('');
}

function generateTableRow(category, group, percentage) {
    return `<tr class="${category}-row"><td>${group}</td><td>${percentage}%</td></tr>`;
}

function calculatePercentage(section) {
    return (section.percentage || 0).toFixed(2);
}

// Add event listener to all select elements
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', () => {
        const scores = calculateScore(); // Call the calculateScore function to get the scores object
        updateScoreDisplay(scores); // Call the updateScoreDisplay function to update the values in the HTML
    });
});
