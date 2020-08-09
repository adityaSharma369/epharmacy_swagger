# API

API_schemas
plans - id - source_plan_id - title - description - category

tasks - id - source_task_id - plan_id - title - order - next_task_delay : hrs -- not implement in this version

sections - id - type // card, icon, text - meta // jsonB -- extra info like card, video - source_section_id - task_id - heading + {'align':'left,right,middle','text':'Heading','level':'h1,h2,h3'} - body // html - buttons + {'butons':[{'text':'continue','style':'primary','value':'done','actions':['open:diary','postTask']}]} - order

meta@video - {'url':'http://testing.com/video.mp4'}

meta@audio - {'url':'http://testing.com/video.mp3'}

meta@card - {'heading':'tesiing','icon':'edit','html':,'color':'orange','actions':['open:selfie']}

meta@icon - {'class':'complete','size':'medium'}

customer_plans // journey - id - plan_id - user_id -- default - start_date - last_task_id - title - next_task_after -- this time

plan_responses - id - user_id - plan_id - task_id - section_id - response

dairy - id - user_id - date - task_id - section_id - title - content

CMS -- raw tasks, sections api -- master tasks, plans, sections response -- user_plan, user_section

dependencies
PlanRecord getPlan(plan_id) // returns plan object

TaskRecord <- Db, DbClient getPlanTasks(plan_id) // return []tasks in order getTask(plan_id,task_id) // return task getNextOrderTask(plan_id,input_order) // return first task having order >= input_order

PlanResponseRecord add() // N/A this version since we are not capturing any data

DairyRecord(Db,Dbclient) add(dairyObject) // return dairy_id Db.insert(dairyObject) // generate insert script with key:value as column:value edit(id, dairyObject) list(user_id=optional) delete(id)

CustomerPlanRecord getActiveCustomerPlan(user_id) // return journeyObject getPlan(plan_id) // return journeyObject updateLastTask(customer_plan_id,last_task_id,delay) //

SectionRecord getTaskSections(task_id) // returns []sections in order

JourneyService <- CustomerPlanRecord, TaskRecord, PlanRecord, SectionRecord

getJourneyTimeline(user_id)
journeyObject = CustomerPlanRecord.getActiveCustomerPlan()
plan_id, last_task_id = unpack journeyObject
allTaks = TaskRecord.getPlanTasks(plan_id) // 20 tasks
planObj = PlanRecord.get(plan_id)

getNextTask(customer_plan_id)
journeyObject = CustomerPlanRecord.getPlan(customer_plan_id)
plan_id, last_task_id = unpack journeyObject
last_task = TaskRecord.getTask(plan_id,last_task_id)
new_order = last_task.order+1
new_task = TaskRecord.getNextOrderTask(last_task_id)
new_task_sections = SectionRecord.getTaskRecords(new_task.id)

    // UPDATE journey (or) customer_plan TABLE
    delay = 0;
    CustomerPlanRecord.updateLastTask(customer_plan_id,new_task.id,delay)

    return {task,sections}
    + returns empty {} if task for day is done or next delay is set

JourneyController <- JourneyService, CustomerPlanRecord, TaskRecord

- /getJourneyTimeline - user_id

  - JourneyService.getJourneyTimeline(user_id)
  - return active plan, plan info, allTaks, last_last_id

- /getNextTask -- customer_plan_id (OR) journey_id

  - JourneyService.getNextTask(customer_plan_id)
  - return {task,sections}

- /postTask -- customer_plan_id, response, task_id, screen_id + JourneyService.getNextTask(customer_plan_id) + return {task,sections}
  DairyController <- DairyRecord

- dairy/list
- dairy/edit
- dairy/add
- dairy/delete
  seeding all excel data into tasks
  write a SQL script
