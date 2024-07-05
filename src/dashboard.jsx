import React from 'react';
import './dashboard.css';

function Dashboard({ users }) {
  // Sorting users based on growthRateProgress and growthRateRank
  const sortedUsers = users.sort((a, b) => {
    return b.growthRateProgress - a.growthRateProgress || a.growthRateRank - b.growthRateRank;
  });

  return (
    <div className="dashboard">
      <h2 className="dashboard-heading">Ranking List</h2>
      <table>
        <thead>
          <tr>
            <th>Ign - Class</th>
            <th>Accuracy</th>
            <th>Main Quest</th>
            <th>Growth rate progress</th>
            <th>Growth rate rank</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user, index) => (
            <tr key={index}>
              <td>{user.ign}</td>
              <td>{user.acc}</td>
              <td>{user.mq}</td>
              <td>{user.growthRateProgress}</td>
              <td>{user.growthRateRank}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
