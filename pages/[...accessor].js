import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { get } from "lodash";
import { getStacked, getStxBalance } from "../utils";
import tokenConfig from "../tokenConfig.json";

const DynamicComponentWithNoSSR = dynamic(() => import("react-qr-scanner"), {
  ssr: false,
});

export default function Accessor() {
  const router = useRouter();
  const { accessor } = router.query;
  const [state, setState] = useState({
    cameraId: undefined,
    delay: 500,
    devices: [],
    loading: false,
    data: null,
    poh: null,
  });

  useEffect(() => {
    const getDevices = async () => {
      let devices = [];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
        devices = devices.filter((device) => device.kind === "videoinput");
      } catch (e) {
        console.log("error", e);
      } finally {
        setState({
          ...state,
          devices,
          cameraId: devices[0].deviceId,
          loading: false,
        });
      }
    };

    getDevices();
  }, []);

  useEffect(async () => {
    const fetchWallet = async (address) => {
      const wallet = await getStxBalance(address);
      const approved = get(wallet, accessor);

      if (!approved) {
        return 0;
      }

      switch (accessor[0]) {
        case "fungible_tokens": {
          const currentBalance = Number(approved.balance);

          if (currentBalance > 0) {
            return currentBalance;
          }

          const isCityCoin = tokenConfig[accessor[1].split(".")[1]];

          if (isCityCoin) {
            const { contractAddress, contractName } =
              tokenConfig[accessor[1].split(".")[1]];
            const stacked = await getStacked(
              contractAddress,
              contractName,
              address
            );

            return stacked;
          }
        }

        case "non_fungible_tokens":
          return Number(approved.count);
        default:
          throw new Error("NOT FOUND!");
      }
    };

    if (state.data) {
      setState({ ...state, loading: true });
      const poh = await fetchWallet(state.data);
      setState({ ...state, poh: poh > 0, loading: false });
      setTimeout(() => {
        setState({ ...state, data: null, poh: null });
      }, 2000);
    }
  }, [state.data]);

  const handleError = (e) => {
    console.log(">>>>>>>", e);
  };

  const handleScan = (data) => {
    if (data?.text) {
      setState({ ...state, data: data?.text });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ flexDirection: "column" }}>
        <div>
          Checking For: <br /> {JSON.stringify(accessor, null, 2)}
        </div>
        <div style={{ marginTop: "48px" }}>
          {state.devices.length > 0 && (
            <select
              onChange={(e) => {
                const value = e.target.value;
                setState({ ...state, cameraId: value });
              }}
            >
              {state.devices.map((deviceInfo, index) => (
                <option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>
                  {deviceInfo.label || `camera ${index}`}
                </option>
              ))}
            </select>
          )}
        </div>
        <div style={{ marginTop: "20px" }}>
          {!state.loading && (
            <DynamicComponentWithNoSSR
              delay={state.delay}
              style={{ width: "100%", height: "25vh" }}
              onError={handleError}
              onScan={handleScan}
              constraints={
                state.cameraId && {
                  audio: false,
                  video: { deviceId: state.cameraId },
                }
              }
            />
          )}
        </div>
        <div style={{ padding: "10px" }}>
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
