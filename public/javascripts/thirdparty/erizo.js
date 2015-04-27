var Erizo = Erizo || {};
Erizo.EventDispatcher = function(b) {
  var a = {};
  b.dispatcher = {};
  b.dispatcher.eventListeners = {};
  a.addEventListener = function(a, d) {
    void 0 === b.dispatcher.eventListeners[a] && (b.dispatcher.eventListeners[a] = []);
    b.dispatcher.eventListeners[a].push(d)
  };
  a.removeEventListener = function(a, d) {
    var f;
    f = b.dispatcher.eventListeners[a].indexOf(d);
    -1 !== f && b.dispatcher.eventListeners[a].splice(f, 1)
  };
  a.dispatchEvent = function(a) {
    var d;
    L.Logger.debug("Event: " + a.type);
    for(d in b.dispatcher.eventListeners[a.type]) {
      if(b.dispatcher.eventListeners[a.type].hasOwnProperty(d)) {
        b.dispatcher.eventListeners[a.type][d](a)
      }
    }
  };
  return a
};
Erizo.LicodeEvent = function(b) {
  var a = {};
  a.type = b.type;
  return a
};
Erizo.RoomEvent = function(b) {
  var a = Erizo.LicodeEvent(b);
  a.streams = b.streams;
  return a
};
Erizo.StreamEvent = function(b) {
  var a = Erizo.LicodeEvent(b);
  a.stream = b.stream;
  a.msg = b.msg;
  return a
};
Erizo.PublisherEvent = function(b) {
  return Erizo.LicodeEvent(b)
};
Erizo = Erizo || {};
Erizo.FcStack = function() {
  return{addStream:function() {
  }}
};
Erizo = Erizo || {};
Erizo.FirefoxStack = function(b) {
  var a = {}, c = mozRTCPeerConnection, d = mozRTCSessionDescription, f = !1;
  a.pc_config = {iceServers:[]};
  void 0 !== b.stunServerUrl && a.pc_config.iceServers.push({url:b.stunServerUrl});
  void 0 === b.audio && (b.audio = !0);
  void 0 === b.video && (b.video = !0);
  a.mediaConstraints = {optional:[], mandatory:{OfferToReceiveAudio:b.audio, OfferToReceiveVideo:b.video, MozDontOfferDataChannel:!0}};
  a.roapSessionId = 103;
  a.peerConnection = new c;
  a.peerConnection.onicecandidate = function(f) {
    L.Logger.debug("PeerConnection: ", b.session_id);
    if(f.candidate) {
      a.iceCandidateCount = a.iceCandidateCount + 1
    }else {
      L.Logger.debug("State: " + a.peerConnection.iceGatheringState);
      if(a.ices === void 0) {
        a.ices = 0
      }
      a.ices = a.ices + 1;
      L.Logger.debug(a.ices);
      if(a.ices >= 1 && a.moreIceComing) {
        a.moreIceComing = false;
        a.markActionNeeded()
      }
    }
  };
  L.Logger.debug('Created webkitRTCPeerConnnection with config "' + JSON.stringify(a.pc_config) + '".');
  a.processSignalingMessage = function(b) {
    L.Logger.debug("Activity on conn " + a.sessionId);
	console.log(b);
    b = JSON.parse(b);
    a.incomingMessage = b;
    if(a.state === "new") {
      if(b.messageType === "OFFER") {
        b = {sdp:b.sdp, type:"offer"};
        a.peerConnection.setRemoteDescription(new d(b));
        a.state = "offer-received";
        a.markActionNeeded()
      }else {
        a.error("Illegal message for this state: " + b.messageType + " in state " + a.state)
      }
    }else {
      if(a.state === "offer-sent") {
        if(b.messageType === "ANSWER") {
          b.sdp = b.sdp.replace(/ generation 0/g, "");
          b.sdp = b.sdp.replace(/ udp /g, " UDP ");
          b = {sdp:b.sdp, type:"answer"};
          L.Logger.debug("Received ANSWER: ", b.sdp);
          a.peerConnection.setRemoteDescription(new d(b));
          a.sendOK();
          a.state = "established"
        }else {
          if(b.messageType === "pr-answer") {
            b = {sdp:b.sdp, type:"pr-answer"};
            a.peerConnection.setRemoteDescription(new d(b))
          }else {
            b.messageType === "offer" ? a.error("Not written yet") : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state)
          }
        }
      }else {
        if(a.state === "established") {
          if(b.messageType === "OFFER") {
            b = {sdp:b.sdp, type:"offer"};
            a.peerConnection.setRemoteDescription(new d(b));
            a.state = "offer-received";
            a.markActionNeeded()
          }else {
            a.error("Illegal message for this state: " + b.messageType + " in state " + a.state)
          }
        }
      }
    }
  };
  a.addStream = function(b) {
    f = true;
    a.peerConnection.addStream(b);
    a.markActionNeeded()
  };
  a.removeStream = function() {
    a.markActionNeeded()
  };
  a.close = function() {
    a.state = "closed";
    a.peerConnection.close()
  };
  a.markActionNeeded = function() {
    a.actionNeeded = true;
    a.doLater(function() {
      a.onstablestate()
    })
  };
  a.doLater = function(a) {
    window.setTimeout(a, 1)
  };
  a.onstablestate = function() {
    var b;
    if(a.actionNeeded) {
      if(a.state === "new" || a.state === "established") {
        L.Logger.debug("Creating offer");
        if(f) {
          a.mediaConstraints = void 0
        }
        (function() {
          a.peerConnection.createOffer(function(b) {
            var f = b.sdp;
            L.Logger.debug("Changed", b.sdp);
            if(f !== a.prevOffer) {
              a.peerConnection.setLocalDescription(b);
              a.state = "preparing-offer";
              a.markActionNeeded()
            }else {
              L.Logger.debug("Not sending a new offer")
            }
          }, function(a) {
            L.Logger.debug("Ups! Something went wrong ", a)
          }, a.mediaConstraints)
        })()
      }else {
        if(a.state === "preparing-offer") {
          if(a.moreIceComing) {
            return
          }
          a.prevOffer = a.peerConnection.localDescription.sdp;
          L.Logger.debug("Sending OFFER: ", a.prevOffer);
          a.sendMessage("OFFER", a.prevOffer);
          a.state = "offer-sent"
        }else {
          if(a.state === "offer-received") {
            a.peerConnection.createAnswer(function(b) {
              a.peerConnection.setLocalDescription(b);
              a.state = "offer-received-preparing-answer";
              if(a.iceStarted) {
                a.markActionNeeded()
              }else {
                L.Logger.debug((new Date).getTime() + ": Starting ICE in responder");
                a.iceStarted = true
              }
            }, function() {
              L.Logger.debug("Ups! Something went wrong")
            })
          }else {
            if(a.state === "offer-received-preparing-answer") {
              if(a.moreIceComing) {
                return
              }
              b = a.peerConnection.localDescription.sdp;
              a.sendMessage("ANSWER", b);
              a.state = "established"
            }else {
              a.error("Dazed and confused in state " + a.state + ", stopping here")
            }
          }
        }
      }
      a.actionNeeded = false
    }
  };
  a.sendOK = function() {
    a.sendMessage("OK")
  };
  a.sendMessage = function(b, f) {
    var d = {};
    d.messageType = b;
    d.sdp = f;
    if(b === "OFFER") {
      d.offererSessionId = a.sessionId;
      d.answererSessionId = a.otherSessionId;
      d.seq = a.sequenceNumber = a.sequenceNumber + 1;
      d.tiebreaker = Math.floor(Math.random() * 429496723 + 1)
    }else {
      d.offererSessionId = a.incomingMessage.offererSessionId;
      d.answererSessionId = a.sessionId;
      d.seq = a.incomingMessage.seq
    }
    a.onsignalingmessage(JSON.stringify(d))
  };
  a.error = function(a) {
    throw"Error in RoapOnJsep: " + a;
  };
  a.sessionId = a.roapSessionId += 1;
  a.sequenceNumber = 0;
  a.actionNeeded = !1;
  a.iceStarted = !1;
  a.moreIceComing = !0;
  a.iceCandidateCount = 0;
  a.onsignalingmessage = b.callback;
  a.peerConnection.onopen = function() {
    if(a.onopen) {
      a.onopen()
    }
  };
  a.peerConnection.onaddstream = function(b) {
    if(a.onaddstream) {
      a.onaddstream(b)
    }
  };
  a.peerConnection.onremovestream = function(b) {
    if(a.onremovestream) {
      a.onremovestream(b)
    }
  };
  a.peerConnection.oniceconnectionstatechange = function(b) {
    if(a.oniceconnectionstatechange) {
      a.oniceconnectionstatechange(b.currentTarget.iceConnectionState)
    }
  };
  a.onaddstream = null;
  a.onremovestream = null;
  a.state = "new";
  a.markActionNeeded();
  return a
};
Erizo = Erizo || {};
Erizo.ChromeStableStack = function(b) {
  var a = {}, c = webkitRTCPeerConnection;
  a.pc_config = {iceServers:[]};
  a.con = {optional:[{DtlsSrtpKeyAgreement:!0}]};
  void 0 !== b.stunServerUrl && a.pc_config.iceServers.push({url:b.stunServerUrl});
  (b.turnServer || {}).url && a.pc_config.iceServers.push({username:b.turnServer.username, credential:b.turnServer.password, url:b.turnServer.url});
  if(void 0 === b.audio || b.nop2p) {
    b.audio = !0
  }
  if(void 0 === b.video || b.nop2p) {
    b.video = !0
  }
  a.mediaConstraints = {mandatory:{OfferToReceiveVideo:b.video, OfferToReceiveAudio:b.audio}};
  a.roapSessionId = 103;
  a.peerConnection = new c(a.pc_config, a.con);
  a.peerConnection.onicecandidate = function(f) {
    L.Logger.debug("PeerConnection: ", b.session_id);
    if(f.candidate) {
      a.iceCandidateCount += 1
    }else {
      if(L.Logger.debug("State: " + a.peerConnection.iceGatheringState), void 0 === a.ices && (a.ices = 0), a.ices += 1, 1 <= a.ices && a.moreIceComing) {
        a.moreIceComing = !1, a.markActionNeeded()
      }
    }
  };
  var d = function(a) {
    if(b.maxVideoBW) {
      var d = a.match(/m=video.*\r\n/), c = d[0] + "b=AS:" + b.maxVideoBW + "\r\n", a = a.replace(d[0], c)
    }
    b.maxAudioBW && (d = a.match(/m=audio.*\r\n/), c = d[0] + "b=AS:" + b.maxAudioBW + "\r\n", a = a.replace(d[0], c));
    return a
  };
  a.processSignalingMessage = function(b) {
    L.Logger.debug("Activity on conn " + a.sessionId);
	console.log(b);
    b = JSON.parse(b);
    a.incomingMessage = b;
    "new" === a.state ? "OFFER" === b.messageType ? (b = {sdp:b.sdp, type:"offer"}, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received", a.markActionNeeded()) : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state) : "offer-sent" === a.state ? "ANSWER" === b.messageType ? (b = {sdp:b.sdp, type:"answer"}, L.Logger.debug("Received ANSWER: ", b.sdp), b.sdp = d(b.sdp), a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),
    a.sendOK(), a.state = "established") : "pr-answer" === b.messageType ? (b = {sdp:b.sdp, type:"pr-answer"}, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b))) : "offer" === b.messageType ? a.error("Not written yet") : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state) : "established" === a.state && ("OFFER" === b.messageType ? (b = {sdp:b.sdp, type:"offer"}, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received",
    a.markActionNeeded()) : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state))
  };
  a.addStream = function(b) {
    a.peerConnection.addStream(b);
    a.markActionNeeded()
  };
  a.removeStream = function() {
    a.markActionNeeded()
  };
  a.close = function() {
    a.state = "closed";
    a.peerConnection.close()
  };
  a.markActionNeeded = function() {
    a.actionNeeded = !0;
    a.doLater(function() {
      a.onstablestate()
    })
  };
  a.doLater = function(a) {
    window.setTimeout(a, 1)
  };
  a.onstablestate = function() {
    var b;
    if(a.actionNeeded) {
      if("new" === a.state || "established" === a.state) {
        a.peerConnection.createOffer(function(b) {
          b.sdp = d(b.sdp);
          L.Logger.debug("Changed", b.sdp);
          b.sdp !== a.prevOffer ? (a.peerConnection.setLocalDescription(b), a.state = "preparing-offer", a.markActionNeeded()) : L.Logger.debug("Not sending a new offer")
        }, null, a.mediaConstraints)
      }else {
        if("preparing-offer" === a.state) {
          if(a.moreIceComing) {
            return
          }
          a.prevOffer = a.peerConnection.localDescription.sdp;
          L.Logger.debug("Sending OFFER: " + a.prevOffer);
          a.sendMessage("OFFER", a.prevOffer);
          a.state = "offer-sent"
        }else {
          if("offer-received" === a.state) {
            a.peerConnection.createAnswer(function(b) {
              a.peerConnection.setLocalDescription(b);
              a.state = "offer-received-preparing-answer";
              a.iceStarted ? a.markActionNeeded() : (L.Logger.debug((new Date).getTime() + ": Starting ICE in responder"), a.iceStarted = !0)
            }, null, a.mediaConstraints)
          }else {
            if("offer-received-preparing-answer" === a.state) {
              if(a.moreIceComing) {
                return
              }
              b = a.peerConnection.localDescription.sdp;
              a.sendMessage("ANSWER", b);
              a.state = "established"
            }else {
              a.error("Dazed and confused in state " + a.state + ", stopping here")
            }
          }
        }
      }
      a.actionNeeded = !1
    }
  };
  a.sendOK = function() {
    a.sendMessage("OK")
  };
  a.sendMessage = function(b, d) {
    var c = {};
    c.messageType = b;
    c.sdp = d;
    "OFFER" === b ? (c.offererSessionId = a.sessionId, c.answererSessionId = a.otherSessionId, c.seq = a.sequenceNumber += 1, c.tiebreaker = Math.floor(429496723 * Math.random() + 1)) : (c.offererSessionId = a.incomingMessage.offererSessionId, c.answererSessionId = a.sessionId, c.seq = a.incomingMessage.seq);
    a.onsignalingmessage(JSON.stringify(c))
  };
  a.error = function(a) {
    throw"Error in RoapOnJsep: " + a;
  };
  a.sessionId = a.roapSessionId += 1;
  a.sequenceNumber = 0;
  a.actionNeeded = !1;
  a.iceStarted = !1;
  a.moreIceComing = !0;
  a.iceCandidateCount = 0;
  a.onsignalingmessage = b.callback;
  a.peerConnection.onopen = function() {
    if(a.onopen) {
      a.onopen()
    }
  };
  a.peerConnection.onaddstream = function(b) {
    if(a.onaddstream) {
      a.onaddstream(b)
    }
  };
  a.peerConnection.onremovestream = function(b) {
    if(a.onremovestream) {
      a.onremovestream(b)
    }
  };
  a.peerConnection.oniceconnectionstatechange = function(b) {
    if(a.oniceconnectionstatechange) {
      a.oniceconnectionstatechange(b.currentTarget.iceConnectionState)
    }
  };
  a.onaddstream = null;
  a.onremovestream = null;
  a.state = "new";
  a.markActionNeeded();
  return a
};
Erizo = Erizo || {};
Erizo.ChromeCanaryStack = function(b) {
  var a = {}, c = webkitRTCPeerConnection;
  a.pc_config = {iceServers:[]};
  a.con = {optional:[{DtlsSrtpKeyAgreement:!0}]};
  void 0 !== b.stunServerUrl && a.pc_config.iceServers.push({url:b.stunServerUrl});
  (b.turnServer || {}).url && a.pc_config.iceServers.push({username:b.turnServer.username, credential:b.turnServer.password, url:b.turnServer.url});
  if(void 0 === b.audio || b.nop2p) {
    b.audio = !0
  }
  if(void 0 === b.video || b.nop2p) {
    b.video = !0
  }
  a.mediaConstraints = {mandatory:{OfferToReceiveVideo:b.video, OfferToReceiveAudio:b.audio}};
  a.roapSessionId = 103;
  a.peerConnection = new c(a.pc_config, a.con);
  a.peerConnection.onicecandidate = function(f) {
    L.Logger.debug("PeerConnection: ", b.session_id);
    if(f.candidate) {
      a.iceCandidateCount += 1
    }else {
      if(L.Logger.debug("State: " + a.peerConnection.iceGatheringState), void 0 === a.ices && (a.ices = 0), a.ices += 1, 1 <= a.ices && a.moreIceComing) {
        a.moreIceComing = !1, a.markActionNeeded()
      }
    }
  };
  var d = function(a) {
    if(b.maxVideoBW) {
      var d = a.match(/m=video.*\r\n/), c = d[0] + "b=AS:" + b.maxVideoBW + "\r\n", a = a.replace(d[0], c)
    }
    b.maxAudioBW && (d = a.match(/m=audio.*\r\n/), c = d[0] + "b=AS:" + b.maxAudioBW + "\r\n", a = a.replace(d[0], c));
    return a
  };
  a.processSignalingMessage = function(b) {
    L.Logger.debug("Activity on conn " + a.sessionId);
    b = JSON.parse(b);
    a.incomingMessage = b;
    "new" === a.state ? "OFFER" === b.messageType ? (b = {sdp:b.sdp, type:"offer"}, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received", a.markActionNeeded()) : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state) : "offer-sent" === a.state ? "ANSWER" === b.messageType ? (b = {sdp:b.sdp, type:"answer"}, L.Logger.debug("Received ANSWER: ", b.sdp), b.sdp = d(b.sdp), a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)),
    a.sendOK(), a.state = "established") : "pr-answer" === b.messageType ? (b = {sdp:b.sdp, type:"pr-answer"}, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b))) : "offer" === b.messageType ? a.error("Not written yet") : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state) : "established" === a.state && ("OFFER" === b.messageType ? (b = {sdp:b.sdp, type:"offer"}, a.peerConnection.setRemoteDescription(new RTCSessionDescription(b)), a.state = "offer-received",
    a.markActionNeeded()) : a.error("Illegal message for this state: " + b.messageType + " in state " + a.state))
  };
  a.addStream = function(b) {
    a.peerConnection.addStream(b);
    a.markActionNeeded()
  };
  a.removeStream = function() {
    a.markActionNeeded()
  };
  a.close = function() {
    a.state = "closed";
    a.peerConnection.close()
  };
  a.markActionNeeded = function() {
    a.actionNeeded = !0;
    a.doLater(function() {
      a.onstablestate()
    })
  };
  a.doLater = function(a) {
    window.setTimeout(a, 1)
  };
  a.onstablestate = function() {
    var b;
    if(a.actionNeeded) {
      if("new" === a.state || "established" === a.state) {
        a.peerConnection.createOffer(function(b) {
          b.sdp = d(b.sdp);
          L.Logger.debug("Changed", b.sdp);
          b.sdp !== a.prevOffer ? (a.peerConnection.setLocalDescription(b), a.state = "preparing-offer", a.markActionNeeded()) : L.Logger.debug("Not sending a new offer")
        }, null, a.mediaConstraints)
      }else {
        if("preparing-offer" === a.state) {
          if(a.moreIceComing) {
            return
          }
          a.prevOffer = a.peerConnection.localDescription.sdp;
          L.Logger.debug("Sending OFFER: " + a.prevOffer);
          a.sendMessage("OFFER", a.prevOffer);
          a.state = "offer-sent"
        }else {
          if("offer-received" === a.state) {
            a.peerConnection.createAnswer(function(b) {
              a.peerConnection.setLocalDescription(b);
              a.state = "offer-received-preparing-answer";
              a.iceStarted ? a.markActionNeeded() : (L.Logger.debug((new Date).getTime() + ": Starting ICE in responder"), a.iceStarted = !0)
            }, null, a.mediaConstraints)
          }else {
            if("offer-received-preparing-answer" === a.state) {
              if(a.moreIceComing) {
                return
              }
              b = a.peerConnection.localDescription.sdp;
              a.sendMessage("ANSWER", b);
              a.state = "established"
            }else {
              a.error("Dazed and confused in state " + a.state + ", stopping here")
            }
          }
        }
      }
      a.actionNeeded = !1
    }
  };
  a.sendOK = function() {
    a.sendMessage("OK")
  };
  a.sendMessage = function(b, d) {
    var c = {};
    c.messageType = b;
    c.sdp = d;
    "OFFER" === b ? (c.offererSessionId = a.sessionId, c.answererSessionId = a.otherSessionId, c.seq = a.sequenceNumber += 1, c.tiebreaker = Math.floor(429496723 * Math.random() + 1)) : (c.offererSessionId = a.incomingMessage.offererSessionId, c.answererSessionId = a.sessionId, c.seq = a.incomingMessage.seq);
    a.onsignalingmessage(JSON.stringify(c))
  };
  a.error = function(a) {
    throw"Error in RoapOnJsep: " + a;
  };
  a.sessionId = a.roapSessionId += 1;
  a.sequenceNumber = 0;
  a.actionNeeded = !1;
  a.iceStarted = !1;
  a.moreIceComing = !0;
  a.iceCandidateCount = 0;
  a.onsignalingmessage = b.callback;
  a.peerConnection.onopen = function() {
    if(a.onopen) {
      a.onopen()
    }
  };
  a.peerConnection.onaddstream = function(b) {
    if(a.onaddstream) {
      a.onaddstream(b)
    }
  };
  a.peerConnection.onremovestream = function(b) {
    if(a.onremovestream) {
      a.onremovestream(b)
    }
  };
  a.peerConnection.oniceconnectionstatechange = function(b) {
    if(a.oniceconnectionstatechange) {
      a.oniceconnectionstatechange(b.currentTarget.iceConnectionState)
    }
  };
  a.onaddstream = null;
  a.onremovestream = null;
  a.state = "new";
  a.markActionNeeded();
  return a
};
Erizo = Erizo || {};
Erizo.sessionId = 103;
Erizo.Connection = function(b) {
  var a = {};
  b.session_id = Erizo.sessionId += 1;
  a.browser = "";
  if("undefined" !== typeof module && module.exports) {
    L.Logger.error("Publish/subscribe video/audio streams not supported in erizofc yet"), a = Erizo.FcStack(b)
  }else {
    if(null !== window.navigator.userAgent.match("Firefox")) {
      a.browser = "mozilla", a = Erizo.FirefoxStack(b)
    }else {
      if(26 <= window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1]) {
        L.Logger.debug("Stable"), a = Erizo.ChromeStableStack(b), a.browser = "chrome-stable"
      }else {
        if("25" === window.navigator.appVersion.match(/Bowser\/([\w\W]*?)\./)[1]) {
          a.browser = "bowser"
        }else {
          throw a.browser = "none", "WebRTC stack not available";
        }
      }
    }
  }
  return a
};
Erizo.GetUserMedia = function(b, a, c) {
  navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  if(b.screen) {
    if(L.Logger.debug("Screen access requested"), 34 <= !window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1]) {
      c({code:"This browser does not support screen sharing"})
    }else {
      var d = "okeephmleflklcdebijnponpabbmmgeo";
      b.extensionId && (L.Logger.debug("extensionId supplied, using " + b.extensionId), d = b.extensionId);
      L.Logger.debug("Screen access on chrome stable, looking for extension");
      try {
        chrome.runtime.sendMessage(d, {getStream:!0}, function(d) {
          if(d == void 0) {
            L.Logger.debug("Access to screen denied");
            c({code:"Access to screen denied"})
          }else {
            b = {video:{mandatory:{chromeMediaSource:"desktop", chromeMediaSourceId:d.streamId}}};
            navigator.getMedia(b, a, c)
          }
        })
      }catch(f) {
        L.Logger.debug("Lynckia screensharing plugin is not accessible "), c({code:"no_plugin_present"})
      }
    }
  }else {
    "undefined" !== typeof module && module.exports ? L.Logger.error("Video/audio streams not supported in erizofc yet") : navigator.getMedia(b, a, c)
  }
};
Erizo = Erizo || {};
Erizo.Stream = function(b) {
  var a = Erizo.EventDispatcher(b), c;
  a.stream = b.stream;
  a.url = b.url;
  a.recording = b.recording;
  a.room = void 0;
  a.showing = !1;
  a.local = !1;
  a.video = b.video;
  a.audio = b.audio;
  a.screen = b.screen;
  a.videoSize = b.videoSize;
  a.extensionId = b.extensionId;
  if(void 0 !== a.videoSize && (!(a.videoSize instanceof Array) || 4 != a.videoSize.length)) {
    throw Error("Invalid Video Size");
  }
  if(void 0 === b.local || !0 === b.local) {
    a.local = !0
  }
  a.getID = function() {
    return b.streamID
  };
  a.getAttributes = function() {
    return b.attributes
  };
  a.setAttributes = function() {
    L.Logger.error("Failed to set attributes data. This Stream object has not been published.")
  };
  a.updateLocalAttributes = function(a) {
    b.attributes = a
  };
  a.hasAudio = function() {
    return b.audio
  };
  a.hasVideo = function() {
    return b.video
  };
  a.hasData = function() {
    return b.data
  };
  a.hasScreen = function() {
    return b.screen
  };
  a.sendData = function() {
    L.Logger.error("Failed to send data. This Stream object has not that channel enabled.")
  };
  a.init = function() {
    try {
      if((b.audio || b.video || b.screen) && void 0 === b.url) {
        L.Logger.debug("Requested access to local media");
        var d = b.video;
        !0 == d && void 0 !== a.videoSize && (d = {mandatory:{minWidth:a.videoSize[0], minHeight:a.videoSize[1], maxWidth:a.videoSize[2], maxHeight:a.videoSize[3]}});
        var c = {video:d, audio:b.audio, fake:b.fake, screen:b.screen, extensionId:a.extensionId};
        L.Logger.debug(c);
        Erizo.GetUserMedia(c, function(b) {
          L.Logger.info("User has granted access to local media.");
          a.stream = b;
          b = Erizo.StreamEvent({type:"access-accepted"});
          a.dispatchEvent(b)
        }, function(b) {
          L.Logger.error("Failed to get access to local media. Error code was " + b.code + ".");
          b = Erizo.StreamEvent({type:"access-denied"});
          a.dispatchEvent(b)
        })
      }else {
        var h = Erizo.StreamEvent({type:"access-accepted"});
        a.dispatchEvent(h)
      }
    }catch(g) {
      L.Logger.error("Error accessing to local media", g)
    }
  };
  a.close = function() {
    a.local && (void 0 !== a.room && a.room.unpublish(a), a.hide(), void 0 !== a.stream && a.stream.stop(), a.stream = void 0)
  };
  a.play = function(b, c) {
    c = c || {};
    a.elementID = b;
    if(a.hasVideo() || this.hasScreen()) {
      if(void 0 !== b) {
        var h = new Erizo.VideoPlayer({id:a.getID(), stream:a, elementID:b, options:c});
        a.player = h;
        a.showing = !0
      }
    }else {
      a.hasAudio && (h = new Erizo.AudioPlayer({id:a.getID(), stream:a, elementID:b, options:c}), a.player = h, a.showing = !0)
    }
  };
  a.stop = function() {
    a.showing && void 0 !== a.player && (a.player.destroy(), a.showing = !1)
  };
  a.show = a.play;
  a.hide = a.stop;
  c = function() {
    if(void 0 !== a.player && void 0 !== a.stream) {
      var b = a.player.video, c = document.defaultView.getComputedStyle(b), h = parseInt(c.getPropertyValue("width"), 10), g = parseInt(c.getPropertyValue("height"), 10), i = parseInt(c.getPropertyValue("left"), 10), c = parseInt(c.getPropertyValue("top"), 10), e = document.getElementById(a.elementID), j = document.defaultView.getComputedStyle(e), e = parseInt(j.getPropertyValue("width"), 10), j = parseInt(j.getPropertyValue("height"), 10), q = document.createElement("canvas");
      q.id = "testing";
      q.width = e;
      q.height = j;
      q.setAttribute("style", "display: none");
      q.getContext("2d").drawImage(b, i, c, h, g);
      return q
    }
    return null
  };
  a.getVideoFrameURL = function(a) {
    var b = c();
    return null !== b ? a ? b.toDataURL(a) : b.toDataURL() : null
  };
  a.getVideoFrame = function() {
    var a = c();
    return null !== a ? a.getContext("2d").getImageData(0, 0, a.width, a.height) : null
  };
  return a
};
Erizo = Erizo || {};
Erizo.Room = function(b) {
  var a = Erizo.EventDispatcher(b), c, d, f, h, g, i;
  a.remoteStreams = {};
  a.localStreams = {};
  a.roomID = "";
  a.socket = {};
  a.state = 0;
  a.p2p = !1;
  a.addEventListener("room-disconnected", function() {
    var b, j;
    a.state = 0;
    for(b in a.remoteStreams) {
      a.remoteStreams.hasOwnProperty(b) && (j = a.remoteStreams[b], i(j), delete a.remoteStreams[b], j = Erizo.StreamEvent({type:"stream-removed", stream:j}), a.dispatchEvent(j))
    }
    a.remoteStreams = {};
    for(b in a.localStreams) {
      a.localStreams.hasOwnProperty(b) && (j = a.localStreams[b], j.pc.close(), delete a.localStreams[b])
    }
    try {
      a.socket.disconnect()
    }catch(c) {
      L.Logger.debug("Socket already disconnected")
    }
    a.socket = void 0
  });
  i = function(a) {
    void 0 !== a.stream && (a.hide(), a.pc.close(), a.local && a.stream.stop())
  };
  h = function(a, b) {
    a.local ? d("sendDataStream", {id:a.getID(), msg:b}) : L.Logger.error("You can not send data through a remote stream")
  };
  g = function(a, b) {
    a.local ? (a.updateLocalAttributes(b), d("updateStreamAttributes", {id:a.getID(), attrs:b})) : L.Logger.error("You can not update attributes in a remote stream")
  };
  c = function(e, j, c) {
    var l = e.host, p = "socket.io", m = e.host.indexOf("/"), k = e.host.indexOf(":");
    -1 !== m && (l = e.host.substring(0, m) + ":" + e.host.substring(k + 1, e.host.length), p = e.host.substring(m + 1, k) + "/" + p);
    a.socket = io.connect(l, {reconnect:!1, secure:e.secure, "force new connection":!0, resource:p});
    a.socket.on("onAddStream", function(b) {
      var e = Erizo.Stream({streamID:b.id, local:false, audio:b.audio, video:b.video, data:b.data, screen:b.screen, attributes:b.attributes});
      a.remoteStreams[b.id] = e;
      b = Erizo.StreamEvent({type:"stream-added", stream:e});
      a.dispatchEvent(b)
    });
    a.socket.on("onSubscribeP2P", function(b) {
      var e = a.localStreams[b.streamId];
      if(e.pc === void 0) {
        e.pc = {}
      }
      e.pc[b.subsSocket] = Erizo.Connection({callback:function(a) {
        f("publish", {state:"p2pSignaling", streamId:b.streamId, subsSocket:b.subsSocket}, a, function(a) {
          a === "error" && callbackError && callbackError(a);
          e.pc[b.subsSocket].onsignalingmessage = function() {
            e.pc[b.subsSocket].onsignalingmessage = function() {
            }
          };
          e.pc[b.subsSocket].processSignalingMessage(a)
        })
      }, audio:e.hasAudio(), video:e.hasVideo(), stunServerUrl:a.stunServerUrl, turnServer:a.turnServer});
      e.pc[b.subsSocket].addStream(e.stream);
      e.pc[b.subsSocket].oniceconnectionstatechange = function(a) {
        if(a === "disconnected") {
          e.pc[b.subsSocket].close();
          delete e.pc[b.subsSocket]
        }
      }
    });
    a.socket.on("onPublishP2P", function(e, j) {
      var c = a.remoteStreams[e.streamId];
      c.pc = Erizo.Connection({callback:function() {
      }, stunServerUrl:a.stunServerUrl, turnServer:a.turnServer, maxAudioBW:b.maxAudioBW, maxVideoBW:b.maxVideoBW});
      c.pc.onsignalingmessage = function(a) {
        c.pc.onsignalingmessage = function() {
        };
        j(a)
      };
      c.pc.processSignalingMessage(e.sdp);
      c.pc.onaddstream = function(b) {
        L.Logger.info("Stream subscribed");
        c.stream = b.stream;
        b = Erizo.StreamEvent({type:"stream-subscribed", stream:c});
        a.dispatchEvent(b)
      }
    });
    a.socket.on("onDataStream", function(b) {
      var e = a.remoteStreams[b.id], b = Erizo.StreamEvent({type:"stream-data", msg:b.msg, stream:e});
      e.dispatchEvent(b)
    });
    a.socket.on("onUpdateAttributeStream", function(b) {
      var e = a.remoteStreams[b.id], j = Erizo.StreamEvent({type:"stream-attributes-update", attrs:b.attrs, stream:e});
      e.updateLocalAttributes(b.attrs);
      e.dispatchEvent(j)
    });
    a.socket.on("onRemoveStream", function(b) {
      var e = a.remoteStreams[b.id];
      delete a.remoteStreams[b.id];
      i(e);
      b = Erizo.StreamEvent({type:"stream-removed", stream:e});
      a.dispatchEvent(b)
    });
    a.socket.on("disconnect", function() {
      L.Logger.info("Socket disconnected");
      if(a.state !== 0) {
        var b = Erizo.RoomEvent({type:"room-disconnected"});
        a.dispatchEvent(b)
      }
    });
    d("token", e, j, c)
  };
  d = function(b, j, c, d) {
    a.socket.emit(b, j, function(a, b) {
      "success" === a ? void 0 !== c && c(b) : void 0 !== d && d(b)
    })
  };
  f = function(b, j, c, d) {
    a.socket.emit(b, j, c, function(a, b) {
      void 0 !== d && d(a, b)
    })
  };
  a.connect = function() {
    var e = L.Base64.decodeBase64(b.token);
    0 !== a.state && L.Logger.error("Room already connected");
    a.state = 1;
    c(JSON.parse(e), function(e) {
      var c = 0, d = [], f, m, k;
      f = e.streams;
      a.p2p = e.p2p;
      m = e.id;
      a.stunServerUrl = e.stunServerUrl;
      a.turnServer = e.turnServer;
      a.state = 2;
      b.defaultVideoBW = e.defaultVideoBW;
      b.maxVideoBW = e.maxVideoBW;
      for(c in f) {
        f.hasOwnProperty(c) && (k = f[c], e = Erizo.Stream({streamID:k.id, local:!1, audio:k.audio, video:k.video, data:k.data, screen:k.screen, attributes:k.attributes}), d.push(e), a.remoteStreams[k.id] = e)
      }
      a.roomID = m;
      L.Logger.info("Connected to room " + a.roomID);
      c = Erizo.RoomEvent({type:"room-connected", streams:d});
      a.dispatchEvent(c)
    }, function(a) {
      L.Logger.error("Not Connected! Error: " + a)
    })
  };
  a.disconnect = function() {
    var b = Erizo.RoomEvent({type:"room-disconnected"});
    a.dispatchEvent(b)
  };
  a.publish = function(e, c, d, l) {
    c = c || {};
    c.maxVideoBW = c.maxVideoBW || b.defaultVideoBW;
    c.maxVideoBW > b.maxVideoBW && (c.maxVideoBW = b.maxVideoBW);
    if(e.local && void 0 === a.localStreams[e.getID()]) {
      if(e.hasAudio() || e.hasVideo() || e.hasScreen()) {
        if(void 0 !== e.url || void 0 !== e.recording) {
          var p;
          e.url ? (c = "url", p = e.url) : (c = "recording", p = e.recording);
          f("publish", {state:c, data:e.hasData(), audio:e.hasAudio(), video:e.hasVideo(), attributes:e.getAttributes()}, p, function(b, c) {
            if(b === "success") {
              L.Logger.info("Stream published");
              e.getID = function() {
                return c
              };
              e.sendData = function(a) {
                h(e, a)
              };
              e.setAttributes = function(a) {
                g(e, a)
              };
              a.localStreams[c] = e;
              e.room = a;
              d && d()
            }else {
              L.Logger.info("Error when publishing the stream", b);
              l && l(b)
            }
          })
        }else {
          a.p2p ? (b.maxAudioBW = c.maxAudioBW, b.maxVideoBW = c.maxVideoBW, f("publish", {state:"p2p", data:e.hasData(), audio:e.hasAudio(), video:e.hasVideo(), screen:e.hasScreen(), attributes:e.getAttributes()}, void 0, function(b, c) {
            b === "error" && l && l(b);
            L.Logger.info("Stream published");
            e.getID = function() {
              return c
            };
            if(e.hasData()) {
              e.sendData = function(a) {
                h(e, a)
              }
            }
            e.setAttributes = function(a) {
              g(e, a)
            };
            a.localStreams[c] = e;
            e.room = a
          })) : (e.pc = Erizo.Connection({callback:function(b) {
            f("publish", {state:"offer", data:e.hasData(), audio:e.hasAudio(), video:e.hasVideo(), attributes:e.getAttributes()}, b, function(b, c) {
              if(b === "error") {
                l && l(b)
              }else {
                e.pc.onsignalingmessage = function(b) {
                  e.pc.onsignalingmessage = function() {
                  };
                  f("publish", {state:"ok", streamId:c, data:e.hasData(), audio:e.hasAudio(), video:e.hasVideo(), screen:e.hasScreen(), attributes:e.getAttributes()}, b);
                  L.Logger.info("Stream published");
                  e.getID = function() {
                    return c
                  };
                  if(e.hasData()) {
                    e.sendData = function(a) {
                      h(e, a)
                    }
                  }
                  e.setAttributes = function(a) {
                    g(e, a)
                  };
                  a.localStreams[c] = e;
                  e.room = a
                };
                e.pc.processSignalingMessage(b)
              }
            })
          }, stunServerUrl:a.stunServerUrl, turnServer:a.turnServer, maxAudioBW:c.maxAudioBW, maxVideoBW:c.maxVideoBW}), e.pc.addStream(e.stream))
        }
      }else {
        e.hasData() && f("publish", {state:"data", data:e.hasData(), audio:!1, video:!1, screen:!1, attributes:e.getAttributes()}, void 0, function(b, c) {
          if(b === "error") {
            l && l(b)
          }else {
            L.Logger.info("Stream published");
            e.getID = function() {
              return c
            };
            e.sendData = function(a) {
              h(e, a)
            };
            e.setAttributes = function(a) {
              g(e, a)
            };
            a.localStreams[c] = e;
            e.room = a
          }
        })
      }
    }
  };
  a.startRecording = function(a, b, c) {
    L.Logger.debug("Start Recording streamaa: " + a.getID());
    d("startRecorder", {to:a.getID()}, b, c)
  };
  a.stopRecording = function(a, b, c) {
    d("stopRecorder", {id:a}, b, c)
  };
  a.unpublish = function(b) {
    if(b.local) {
      d("unpublish", b.getID());
      b.room = void 0;
      if((b.hasAudio() || b.hasVideo() || b.hasScreen()) && void 0 === b.url) {
        b.pc.close(), b.pc = void 0
      }
      delete a.localStreams[b.getID()];
      b.getID = function() {
      };
      b.sendData = function() {
      };
      b.setAttributes = function() {
      }
    }
  };
  a.subscribe = function(b, c, d) {
    c = c || {};
    if(!b.local) {
      if(b.hasVideo() || b.hasAudio() || b.hasScreen()) {
        a.p2p ? f("subscribe", {streamId:b.getID()}) : (b.pc = Erizo.Connection({callback:function(a) {
          f("subscribe", {streamId:b.getID(), audio:c.audio, video:c.video, data:c.data}, a, function(a) {
            "error" === a ? d && d(a) : (a.match(/a=ssrc:55543/) && (a = a.replace(/a=sendrecv\\r\\na=mid:video/, "a=recvonly\\r\\na=mid:video"), a = a.split("a=ssrc:55543")[0] + '"}'), b.pc.processSignalingMessage(a))
          })
        }, nop2p:!0, audio:b.hasAudio(), video:b.hasVideo(), stunServerUrl:a.stunServerUrl, turnServer:a.turnServer}), b.pc.onaddstream = function(c) {
          L.Logger.info("Stream subscribed");
          b.stream = c.stream;
          c = Erizo.StreamEvent({type:"stream-subscribed", stream:b});
          a.dispatchEvent(c)
        })
      }else {
        if(b.hasData() && !1 !== c.data) {
          f("subscribe", {streamId:b.getID(), data:c.data}, void 0, function(c) {
            "error" === c ? d && d(c) : (L.Logger.info("Stream subscribed"), c = Erizo.StreamEvent({type:"stream-subscribed", stream:b}), a.dispatchEvent(c))
          })
        }else {
          L.Logger.info("Subscribing to anything");
          return
        }
      }
      L.Logger.info("Subscribing to: " + b.getID())
    }
  };
  a.unsubscribe = function(b, c) {
    void 0 !== a.socket && (b.local || d("unsubscribe", b.getID(), function() {
      "error" === answer ? c && c(answer) : i(b)
    }, function() {
      L.Logger.error("Error calling unsubscribe.")
    }))
  };
  a.getStreamsByAttribute = function(b, c) {
    var d = [], f, g;
    for(f in a.remoteStreams) {
      a.remoteStreams.hasOwnProperty(f) && (g = a.remoteStreams[f], void 0 !== g.getAttributes() && void 0 !== g.getAttributes()[b] && g.getAttributes()[b] === c && d.push(g))
    }
    return d
  };
  return a
};
var L = L || {};
L.Logger = function(b) {
  return{DEBUG:0, TRACE:1, INFO:2, WARNING:3, ERROR:4, NONE:5, enableLogPanel:function() {
    b.Logger.panel = document.createElement("textarea");
    b.Logger.panel.setAttribute("id", "licode-logs");
    b.Logger.panel.setAttribute("style", "width: 100%; height: 100%; display: none");
    b.Logger.panel.setAttribute("rows", 20);
    b.Logger.panel.setAttribute("cols", 20);
    b.Logger.panel.setAttribute("readOnly", !0);
    document.body.appendChild(b.Logger.panel)
  }, setLogLevel:function(a) {
    a > b.Logger.NONE ? a = b.Logger.NONE : a < b.Logger.DEBUG && (a = b.Logger.DEBUG);
    b.Logger.logLevel = a
  }, log:function(a) {
    var c = "";
    if(!(a < b.Logger.logLevel)) {
      a === b.Logger.DEBUG ? c += "DEBUG" : a === b.Logger.TRACE ? c += "TRACE" : a === b.Logger.INFO ? c += "INFO" : a === b.Logger.WARNING ? c += "WARNING" : a === b.Logger.ERROR && (c += "ERROR");
      for(var c = c + ": ", d = [], f = 0;f < arguments.length;f++) {
        d[f] = arguments[f]
      }
      d = d.slice(1);
      d = [c].concat(d);
      if(void 0 !== b.Logger.panel) {
        c = "";
        for(f = 0;f < d.length;f++) {
          c += d[f]
        }
        b.Logger.panel.value = b.Logger.panel.value + "\n" + c
      }else {
        console.log.apply(console, d)
      }
    }
  }, debug:function() {
    for(var a = [], c = 0;c < arguments.length;c++) {
      a[c] = arguments[c]
    }
    b.Logger.log.apply(b.Logger, [b.Logger.DEBUG].concat(a))
  }, trace:function() {
    for(var a = [], c = 0;c < arguments.length;c++) {
      a[c] = arguments[c]
    }
    b.Logger.log.apply(b.Logger, [b.Logger.TRACE].concat(a))
  }, info:function() {
    for(var a = [], c = 0;c < arguments.length;c++) {
      a[c] = arguments[c]
    }
    b.Logger.log.apply(b.Logger, [b.Logger.INFO].concat(a))
  }, warning:function() {
    for(var a = [], c = 0;c < arguments.length;c++) {
      a[c] = arguments[c]
    }
    b.Logger.log.apply(b.Logger, [b.Logger.WARNING].concat(a))
  }, error:function() {
    for(var a = [], c = 0;c < arguments.length;c++) {
      a[c] = arguments[c]
    }
    b.Logger.log.apply(b.Logger, [b.Logger.ERROR].concat(a))
  }}
}(L);
L = L || {};
L.Base64 = function() {
  var b, a, c, d, f, h, g, i, e;
  b = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,+,/".split(",");
  a = [];
  for(f = 0;f < b.length;f += 1) {
    a[b[f]] = f
  }
  h = function(a) {
    c = a;
    d = 0
  };
  g = function() {
    var a;
    if(!c || d >= c.length) {
      return-1
    }
    a = c.charCodeAt(d) & 255;
    d += 1;
    return a
  };
  i = function() {
    if(!c) {
      return-1
    }
    for(;;) {
      if(d >= c.length) {
        return-1
      }
      var b = c.charAt(d);
      d += 1;
      if(a[b]) {
        return a[b]
      }
      if("A" === b) {
        return 0
      }
    }
  };
  e = function(a) {
    a = a.toString(16);
    1 === a.length && (a = "0" + a);
    return unescape("%" + a)
  };
  return{encodeBase64:function(a) {
    var c, e, d;
    h(a);
    a = "";
    c = Array(3);
    e = 0;
    for(d = !1;!d && -1 !== (c[0] = g());) {
      if(c[1] = g(), c[2] = g(), a += b[c[0] >> 2], -1 !== c[1] ? (a += b[c[0] << 4 & 48 | c[1] >> 4], -1 !== c[2] ? (a += b[c[1] << 2 & 60 | c[2] >> 6], a += b[c[2] & 63]) : (a += b[c[1] << 2 & 60], a += "=", d = !0)) : (a += b[c[0] << 4 & 48], a += "=", a += "=", d = !0), e += 4, 76 <= e) {
        a += "\n", e = 0
      }
    }
    return a
  }, decodeBase64:function(a) {
    var b, c;
    h(a);
    a = "";
    b = Array(4);
    for(c = !1;!c && -1 !== (b[0] = i()) && -1 !== (b[1] = i());) {
      b[2] = i(), b[3] = i(), a += e(b[0] << 2 & 255 | b[1] >> 4), -1 !== b[2] ? (a += e(b[1] << 4 & 255 | b[2] >> 2), -1 !== b[3] ? a += e(b[2] << 6 & 255 | b[3]) : c = !0) : c = !0
    }
    return a
  }}
}(L);
(function() {
  function b() {
    (new L.ElementQueries).init()
  }
  this.L = this.L || {};
  this.L.ElementQueries = function() {
    function a(a) {
      a || (a = document.documentElement);
      a = getComputedStyle(a, "fontSize");
      return parseFloat(a) || 16
    }
    function b(c, d) {
      var f = d.replace(/[0-9]*/, ""), d = parseFloat(d);
      switch(f) {
        case "px":
          return d;
        case "em":
          return d * a(c);
        case "rem":
          return d * a();
        case "vw":
          return d * document.documentElement.clientWidth / 100;
        case "vh":
          return d * document.documentElement.clientHeight / 100;
        case "vmin":
        ;
        case "vmax":
          return d * (0,Math["vmin" === f ? "min" : "max"])(document.documentElement.clientWidth / 100, document.documentElement.clientHeight / 100);
        default:
          return d
      }
    }
    function d(a) {
      this.element = a;
      this.options = [];
      var d, f, g, h = 0, m = 0, k, i, n, o, r;
      this.addOption = function(a) {
        this.options.push(a)
      };
      var s = ["min-width", "min-height", "max-width", "max-height"];
      this.call = function() {
        h = this.element.offsetWidth;
        m = this.element.offsetHeight;
        n = {};
        d = 0;
        for(f = this.options.length;d < f;d++) {
          g = this.options[d], k = b(this.element, g.value), i = "width" == g.property ? h : m, r = g.mode + "-" + g.property, o = "", "min" == g.mode && i >= k && (o += g.value), "max" == g.mode && i <= k && (o += g.value), n[r] || (n[r] = ""), o && -1 === (" " + n[r] + " ").indexOf(" " + o + " ") && (n[r] += " " + o)
        }
        for(var a in s) {
          n[s[a]] ? this.element.setAttribute(s[a], n[s[a]].substr(1)) : this.element.removeAttribute(s[a])
        }
      }
    }
    function f(a, b) {
      a.elementQueriesSetupInformation ? a.elementQueriesSetupInformation.addOption(b) : (a.elementQueriesSetupInformation = new d(a), a.elementQueriesSetupInformation.addOption(b), new ResizeSensor(a, function() {
        a.elementQueriesSetupInformation.call()
      }));
      a.elementQueriesSetupInformation.call()
    }
    function h(a) {
      for(var b, a = a.replace(/'/g, '"');null !== (b = i.exec(a));) {
        if(5 < b.length) {
          var c = b[1] || b[5], d = b[2], g = b[3];
          b = b[4];
          var h = void 0;
          document.querySelectorAll && (h = document.querySelectorAll.bind(document));
          !h && "undefined" !== typeof $$ && (h = $$);
          !h && "undefined" !== typeof jQuery && (h = jQuery);
          if(!h) {
            throw"No document.querySelectorAll, jQuery or Mootools's $$ found.";
          }
          for(var c = h(c), h = 0, k = c.length;h < k;h++) {
            f(c[h], {mode:d, property:g, value:b})
          }
        }
      }
    }
    function g(a) {
      var b = "";
      if(a) {
        if("string" === typeof a) {
          a = a.toLowerCase(), (-1 !== a.indexOf("min-width") || -1 !== a.indexOf("max-width")) && h(a)
        }else {
          for(var c = 0, d = a.length;c < d;c++) {
            1 === a[c].type ? (b = a[c].selectorText || a[c].cssText, -1 !== b.indexOf("min-height") || -1 !== b.indexOf("max-height") ? h(b) : (-1 !== b.indexOf("min-width") || -1 !== b.indexOf("max-width")) && h(b)) : 4 === a[c].type && g(a[c].cssRules || a[c].rules)
          }
        }
      }
    }
    var i = /,?([^,\n]*)\[[\s\t]*(min|max)-(width|height)[\s\t]*[~$\^]?=[\s\t]*"([^"]*)"[\s\t]*]([^\n\s\{]*)/mgi;
    this.init = function() {
      for(var a = 0, b = document.styleSheets.length;a < b;a++) {
        g(document.styleSheets[a].cssText || document.styleSheets[a].cssRules || document.styleSheets[a].rules)
      }
    }
  };
  window.addEventListener ? window.addEventListener("load", b, !1) : window.attachEvent("onload", b);
  this.L.ResizeSensor = function(a, b) {
    function d(a, b) {
      window.OverflowEvent ? a.addEventListener("overflowchanged", function(a) {
        b.call(this, a)
      }) : (a.addEventListener("overflow", function(a) {
        b.call(this, a)
      }), a.addEventListener("underflow", function(a) {
        b.call(this, a)
      }))
    }
    function f() {
      this.q = [];
      this.add = function(a) {
        this.q.push(a)
      };
      var a, b;
      this.call = function() {
        a = 0;
        for(b = this.q.length;a < b;a++) {
          this.q[a].call()
        }
      }
    }
    function h(a, b) {
      function c() {
        var b = !1, d = a.resizeSensor.offsetWidth, f = a.resizeSensor.offsetHeight;
        h != d && (k.width = d - 1 + "px", t.width = d + 1 + "px", b = !0, h = d);
        i != f && (k.height = f - 1 + "px", t.height = f + 1 + "px", b = !0, i = f);
        return b
      }
      if(a.resizedAttached) {
        if(a.resizedAttached) {
          a.resizedAttached.add(b);
          return
        }
      }else {
        a.resizedAttached = new f, a.resizedAttached.add(b)
      }
      var g = function() {
        c() && a.resizedAttached.call()
      };
      a.resizeSensor = document.createElement("div");
      a.resizeSensor.className = "resize-sensor";
      a.resizeSensor.style.cssText = "position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;";
      a.resizeSensor.innerHTML = '<div class="resize-sensor-overflow" style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;"><div></div></div><div class="resize-sensor-underflow" style="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;"><div></div></div>';
      a.appendChild(a.resizeSensor);
      if("absolute" !== (a.currentStyle ? a.currentStyle.position : window.getComputedStyle ? window.getComputedStyle(a, null).getPropertyValue("position") : a.style.position)) {
        a.style.position = "relative"
      }
      var h = -1, i = -1, k = a.resizeSensor.firstElementChild.firstChild.style, t = a.resizeSensor.lastElementChild.firstChild.style;
      c();
      d(a.resizeSensor, g);
      d(a.resizeSensor.firstElementChild, g);
      d(a.resizeSensor.lastElementChild, g)
    }
    if("array" === typeof a || "undefined" !== typeof jQuery && a instanceof jQuery || "undefined" !== typeof Elements && a instanceof Elements) {
      for(var g = 0, i = a.length;g < i;g++) {
        h(a[g], b)
      }
    }else {
      h(a, b)
    }
  }
})();
Erizo = Erizo || {};
Erizo.View = function() {
  var b = Erizo.EventDispatcher({});
  b.url = "/images";
  return b
};
Erizo = Erizo || {};
Erizo.VideoPlayer = function(b) {
  var a = Erizo.View({});
  a.id = b.id;
  a.stream = b.stream.stream;
  a.elementID = b.elementID;
  a.destroy = function() {
    a.video.pause();
    delete a.resizer;
    a.parentNode.removeChild(a.div)
  };
  a.resize = function() {
    var c = a.container.offsetWidth, d = a.container.offsetHeight;
    if(b.stream.screen || !1 === b.options.crop) {
      0.75 * c < d ? (a.video.style.width = c + "px", a.video.style.height = 0.75 * c + "px", a.video.style.top = -(0.75 * c / 2 - d / 2) + "px", a.video.style.left = "0px") : (a.video.style.height = d + "px", a.video.style.width = 4 / 3 * d + "px", a.video.style.left = -(4 / 3 * d / 2 - c / 2) + "px", a.video.style.top = "0px")
    }else {
      if(c !== a.containerWidth || d !== a.containerHeight) {
        0.75 * c > d ? (a.video.style.width = c + "px", a.video.style.height = 0.75 * c + "px", a.video.style.top = -(0.75 * c / 2 - d / 2) + "px", a.video.style.left = "0px") : (a.video.style.height = d + "px", a.video.style.width = 4 / 3 * d + "px", a.video.style.left = -(4 / 3 * d / 2 - c / 2) + "px", a.video.style.top = "0px")
      }
    }
    a.containerWidth = c;
    a.containerHeight = d
  };
  L.Logger.debug("Creating URL from stream " + a.stream);
  a.stream_url = (window.URL || webkitURL).createObjectURL(a.stream);
  a.div = document.createElement("div");
  a.div.setAttribute("id", "player_" + a.id);
  a.div.setAttribute("style", "width: 100%; height: 100%; position: relative; background-color: black; overflow: hidden;");
  a.video = document.createElement("video");
  a.video.setAttribute("id", "stream" + a.id);
  a.video.setAttribute("style", "width: 100%; height: 100%; position: absolute");
  a.video.setAttribute("autoplay", "autoplay");
  b.stream.local && (a.video.volume = 0);
  void 0 !== a.elementID ? (document.getElementById(a.elementID).appendChild(a.div), a.container = document.getElementById(a.elementID)) : (document.body.appendChild(a.div), a.container = document.body);
  a.parentNode = a.div.parentNode;
  a.div.appendChild(a.video);
  a.containerWidth = 0;
  a.containerHeight = 0;
  a.resizer = new L.ResizeSensor(a.container, a.resize);
  a.resize();
  a.bar = new Erizo.Bar({elementID:"player_" + a.id, id:a.id, stream:b.stream, media:a.video, options:b.options});
  a.div.onmouseover = function() {
    a.bar.display()
  };
  a.div.onmouseout = function() {
    a.bar.hide()
  };
  a.video.src = a.stream_url;
  return a
};
Erizo = Erizo || {};
Erizo.AudioPlayer = function(b) {
  var a = Erizo.View({}), c, d;
  a.id = b.id;
  a.stream = b.stream.stream;
  a.elementID = b.elementID;
  L.Logger.debug("Creating URL from stream " + a.stream);
  a.stream_url = (window.URL || webkitURL).createObjectURL(a.stream);
  a.audio = document.createElement("audio");
  a.audio.setAttribute("id", "stream" + a.id);
  a.audio.setAttribute("style", "width: 100%; height: 100%; position: absolute");
  a.audio.setAttribute("autoplay", "autoplay");
  b.stream.local && (a.audio.volume = 0);
  b.stream.local && (a.audio.volume = 0);
  void 0 !== a.elementID ? (a.destroy = function() {
    a.audio.pause();
    a.parentNode.removeChild(a.div)
  }, c = function() {
    a.bar.display()
  }, d = function() {
    a.bar.hide()
  }, a.div = document.createElement("div"), a.div.setAttribute("id", "player_" + a.id), a.div.setAttribute("style", "width: 100%; height: 100%; position: relative; overflow: hidden;"), document.getElementById(a.elementID).appendChild(a.div), a.container = document.getElementById(a.elementID), a.parentNode = a.div.parentNode, a.div.appendChild(a.audio), a.bar = new Erizo.Bar({elementID:"player_" + a.id, id:a.id, stream:b.stream, media:a.audio, options:b.options}), a.div.onmouseover = c, a.div.onmouseout =
  d) : (a.destroy = function() {
    a.audio.pause();
    a.parentNode.removeChild(a.audio)
  }, document.body.appendChild(a.audio), a.parentNode = document.body);
  a.audio.src = a.stream_url;
  return a
};
Erizo = Erizo || {};
Erizo.Bar = function(b) {
  var a = Erizo.View({}), c, d;
  a.elementID = b.elementID;
  a.id = b.id;
  a.div = document.createElement("div");
  a.div.setAttribute("id", "bar_" + a.id);
  a.bar = document.createElement("div");
  a.bar.setAttribute("style", "width: 100%; height: 15%; max-height: 30px; position: absolute; bottom: 0; right: 0; background-color: rgba(255,255,255,0.62); display: table;");
  a.bar.setAttribute("id", "subbar_" + a.id);
  a.boxName = document.createElement("span");
  a.boxName.setAttribute("style", "display: table-cell; vertical-align: middle; text-align: center;");
  d = function(b) {
    "block" !== b ? b = "none" : clearTimeout(c);
    a.div.setAttribute("style", "width: 100%; height: 100%; position: relative; bottom: 0; right: 0; display:" + b)
  };
  a.display = function() {
    d("block")
  };
  a.hide = function() {
    c = setTimeout(d, 1E3)
  };
  document.getElementById(a.elementID).appendChild(a.div);
  a.div.appendChild(a.bar);
  a.bar.appendChild(a.boxName);
  void 0 !== b.options.name && (a.textName = document.createTextNode(b.options.name), a.boxName.appendChild(a.textName));
  if(!b.stream.screen && (void 0 === b.options || void 0 === b.options.speaker || !0 === b.options.speaker)) {
    a.speaker = new Erizo.Speaker({elementID:"subbar_" + a.id, id:a.id, stream:b.stream, media:b.media})
  }
  a.display();
  a.hide();
  return a
};
Erizo = Erizo || {};
Erizo.Speaker = function(b) {
  var a = Erizo.View({}), c, d, f, h = 50, g = !1;
  a.elementID = b.elementID;
  a.media = b.media;
  a.id = b.id;
  a.stream = b.stream;
  a.div = document.createElement("div");
  a.div.setAttribute("style", "width: 40%; height: 100%; max-width: 32px; position: absolute; right: 0;z-index:0;");
  a.icon = document.createElement("img");
  a.icon.setAttribute("id", "volume_" + a.id);
  a.icon.setAttribute("src", a.url + "/assets/sound48.png");
  a.icon.setAttribute("style", "width: 80%; height: 100%; position: absolute;");
  a.div.appendChild(a.icon);
  a.stream.local ? (d = function() {
    g = !0;
    a.icon.setAttribute("src", a.url + "/assets/mute48.png");
    a.stream.stream.getAudioTracks()[0].enabled = !1
  }, f = function() {
    g = !1;
    a.icon.setAttribute("src", a.url + "/assets/sound48.png");
    a.stream.stream.getAudioTracks()[0].enabled = !0
  }, a.icon.onclick = function() {
    g ? f() : d()
  }) : (a.picker = document.createElement("input"), a.picker.setAttribute("id", "picker_" + a.id), a.picker.type = "range", a.picker.min = 0, a.picker.max = 100, a.picker.step = 10, a.picker.value = h, a.picker.orient = "vertical", a.div.appendChild(a.picker), a.media.volume = a.picker.value / 100, a.picker.oninput = function() {
    0 < a.picker.value ? (g = !1, a.icon.setAttribute("src", a.url + "/assets/sound48.png")) : (g = !0, a.icon.setAttribute("src", a.url + "/assets/mute48.png"));
    a.media.volume = a.picker.value / 100
  }, c = function(b) {
    a.picker.setAttribute("style", "width: 32px; height: 100px; position: absolute; bottom: 90%; z-index: 1;" + a.div.offsetHeight + "px; right: 0px; -webkit-appearance: slider-vertical; display: " + b)
  }, d = function() {
    g = !0;
    a.icon.setAttribute("src", a.url + "/assets/mute48.png");
    h = a.picker.value;
    a.picker.value = 0;
    a.media.volume = 0
  }, f = function() {
    g = !1;
    a.icon.setAttribute("src", a.url + "/assets/sound48.png");
    a.picker.value = h;
    a.media.volume = a.picker.value / 100
  }, a.icon.onclick = function() {
    g ? f() : d()
  }, a.div.onmouseover = function() {
    c("block")
  }, a.div.onmouseout = function() {
    c("none")
  }, c("none"));
  document.getElementById(a.elementID).appendChild(a.div);
  return a
};

