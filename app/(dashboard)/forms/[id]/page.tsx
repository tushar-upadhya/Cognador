import { GetFormById, GetFormWithSubmissions } from "@/actions/form";
import FormLinkShare from "@/components/FormLinkShare";
import VisitBtn from "@/components/VisitBtn";
import React, { ReactNode } from "react";
import { StatsCard } from "../../page";
import { LuView } from "react-icons/lu";
import { FaWpforms } from "react-icons/fa";
import { HiCursorClick } from "react-icons/hi";
import { TbArrowBounce } from "react-icons/tb";
import { ElementsType, FormElementInstance } from "@/components/FormElements";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, formatDistance } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

async function FormDetailPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = params;
  const form = await GetFormById(Number(id));
  if (!form) {
    throw new Error("form not found");
  }

  const { visits, submissions } = form;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return (
    <>
      <div className="py-10 border-b border-muted">
        <div className="container flex justify-between">
          <h1 className="text-4xl font-bold truncate">{form.name}</h1>
          <VisitBtn shareUrl={form.shareURL} />
        </div>
      </div>
      <div className="py-4 border-b border-muted">
        <div className="container flex items-center justify-between gap-2">
          <FormLinkShare shareUrl={form.shareURL} />
        </div>
      </div>
      <div className="container grid w-full grid-cols-1 gap-4 pt-8 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total visits"
          icon={<LuView className="text-blue-600" />}
          helperText="All time form visits"
          value={visits.toLocaleString() || ""}
          loading={false}
          className="shadow-md shadow-blue-600"
        />

        <StatsCard
          title="Total submissions"
          icon={<FaWpforms className="text-yellow-600" />}
          helperText="All time form submissions"
          value={submissions.toLocaleString() || ""}
          loading={false}
          className="shadow-md shadow-yellow-600"
        />

        <StatsCard
          title="Submission rate"
          icon={<HiCursorClick className="text-green-600" />}
          helperText="Visits that result in form submission"
          value={submissionRate.toLocaleString() + "%" || ""}
          loading={false}
          className="shadow-md shadow-green-600"
        />

        <StatsCard
          title="Bounce rate"
          icon={<TbArrowBounce className="text-red-600" />}
          helperText="Visits that leaves without interacting"
          value={bounceRate.toLocaleString() + "%" || ""}
          loading={false}
          className="shadow-md shadow-red-600"
        />
      </div>

      <div className="container pt-10">
        <SubmissionsTable id={form.id} />
      </div>
    </>
  );
}

export default FormDetailPage;

type Row = { [key: string]: string } & {
  submittedAt: Date;
};

async function SubmissionsTable({ id }: { id: number }) {
  const form = await GetFormWithSubmissions(id);

  if (!form) {
    throw new Error("form not found");
  }

  const formElements = JSON.parse(form.content) as FormElementInstance[];
  const columns: {
    id: string;
    label: string;
    required: boolean;
    type: ElementsType;
  }[] = [];

  formElements.forEach((element) => {
    switch (element.type) {
      case "TextField":
      case "NumberField":
      case "TextAreaField":
      case "DateField":
      case "SelectField":
      case "CheckboxField":
        columns.push({
          id: element.id,
          label: element.extraAttributes?.label,
          required: element.extraAttributes?.required,
          type: element.type,
        });
        break;
      default:
        break;
    }
  });

  const rows: Row[] = [];
  form.FormSubmissions.forEach((submission) => {
    const content = JSON.parse(submission.content);
    rows.push({
      ...content,
      submittedAt: submission.createdAt,
    });
  });

  return (
    <>
      <h1 className="my-4 text-2xl font-bold">Submissions</h1>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className="uppercase">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="text-right uppercase text-muted-foreground">Submitted at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <RowCell key={column.id} type={column.type} value={row[column.id]} />
                ))}
                <TableCell className="text-right text-muted-foreground">
                  {formatDistance(row.submittedAt, new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function RowCell({ type, value }: { type: ElementsType; value: string }) {
  let node: ReactNode = value;

  switch (type) {
    case "DateField":
      if (!value) break;
      const date = new Date(value);
      node = <Badge variant={"outline"}>{format(date, "dd/MM/yyyy")}</Badge>;
      break;
    case "CheckboxField":
      const checked = value === "true";
      node = <Checkbox checked={checked} disabled />;
      break;
  }

  return <TableCell>{node}</TableCell>;
}
