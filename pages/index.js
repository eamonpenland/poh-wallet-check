import React from "react";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <ul>
        <li>
          <Link href="/fungible_tokens/SP466FNC0P7JWTNM2R9T199QRZN1MYEDTAR0KP27.miamicoin-token::miamicoin">
            <a>Miami Coin Check</a>
          </Link>
        </li>
        <li>
          <Link href="/fungible_tokens/SP2H8PY27SEZ03MWRKS5XABZYQN17ETGQS3527SA5.newyorkcitycoin-token::newyorkcitycoin">
            <a>NYC Coin Check</a>
          </Link>
        </li>
      </ul>
    </div>
  );
}
