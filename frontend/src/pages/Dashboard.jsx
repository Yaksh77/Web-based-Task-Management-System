// src/pages/Dashboard.jsx
//  id: serial('id').primaryKey(),
//   title: varchar('title', { length: 255 }).notNull(),
//   description: text('description'),
//   status: statusEnum('status').default('TODO'),
//   priority: priorityEnum('priority').default('MEDIUM'),
//   dueDate: timestamp('dueDate'),
//   createdBy: integer('createdBy').references(() => users.id, { onDelete: 'set null' }),
//   createdAt: timestamp('createdAt').defaultNow(),
import React from "react";
import { useAuthStore } from "../store/userAuthStore";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-center mt-5">
        Welcome to the Dashboard, {user?.name}
      </h1>

    <div className="flex sm:flex-col md:flex-row flex-wrap">
  <Card
        title="Advanced Card"
        subTitle="Card subtitle"
        className="w-[400px] h-[400px] mx-auto mb-5"
      >
        <p className="m-0">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore
          sed consequuntur error repudiandae numquam deserunt quisquam repellat
          libero asperiores earum nam nobis, culpa ratione quam perferendis
          esse, cupiditate neque quas!
        </p>
      </Card>
    </div>
    </div>
  );
}
export default Dashboard;
